"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
 import { DateTime } from "luxon";

import { api } from "@/trpc/react";
import { ComponentLoading } from "@/app/_components/component-loading2";

type Props = {
  questionId: string;
  close: () => void;
};

const ViewEditQuestion = ({ questionId, close }: Props) => {
   function toDateTimeLocalFormat(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16); // trims to "YYYY-MM-DDTHH:MM"
}


  const [editable, setEditable] = useState(false);
  const [localData, setLocalData] = useState<any | null>(null);

  // Initial fetch
const { data, isLoading } = api.question.getById.useQuery({ id: questionId });


  const utils = api.useUtils();
  const updateMutation = api.question.update.useMutation({
    onSuccess: async () => {
      toast.success("Question updated successfully");
      await utils.question.getById.invalidate({ id: questionId });
      setEditable(false);
    },
    onError: (err) => {
      toast.error(err.message || "Error updating question");
    },
  });

useEffect(() => {
    if (data) {
      setLocalData(data); // deep clone to avoid mutating original data
    }
  }, [data]);
    if (isLoading || !localData) {
    return <ComponentLoading message="Loading..." />;
  }
  const updateField = (field: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateTestCase = (id: string, field: string, value: any) => {
    const updated = localData.testCases.map((tc: any) =>
      tc.id === id ? { ...tc, [field]: value } : tc
    );
    setLocalData({ ...localData, testCases: updated });
  };

  const addTestCase = () => {
    const newTestCase = {
      id: crypto.randomUUID(),
      input: "",
      expected: "",
      isVisible: false,
    };
    setLocalData({
      ...localData,
      testCases: [...localData.testCases, newTestCase],
    });
  };

  const removeTestCase = (id: string) => {
    setLocalData({
      ...localData,
      testCases: localData.testCases.filter((tc: any) => tc.id !== id),
    });
  };


const handleSave = () => {
  const startIST = DateTime.fromISO(localData.startTime, { zone: "Asia/Kolkata" });
  const endIST = DateTime.fromISO(localData.endTime, { zone: "Asia/Kolkata" });

  console.log("Updating question (IST):", startIST.toFormat("yyyy-MM-dd HH:mm:ss ZZZZ"), endIST.toFormat("yyyy-MM-dd HH:mm:ss ZZZZ"));

  updateMutation.mutate({
    ...localData,
    startTime: startIST.toISO(), // keeps +05:30
    endTime: endIST.toISO(),
  });
};


  const handleCancel = () => {
    setLocalData(JSON.parse(JSON.stringify(data))); // revert back to original
    setEditable(false);
  };

  const visibleCount = localData.testCases.filter((tc: any) => tc.isVisible).length;
  const hiddenCount = localData.testCases.length - visibleCount;

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">View / Edit Question: {questionId} || {localData.code}</h2>
        {!editable ? (
          <Button onClick={() => setEditable(true)} variant="outline">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Check className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button onClick={handleCancel} variant="ghost">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="w-full mx-auto px-4 py-6 space-y-6">
        {/* Question Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={localData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  disabled={!editable}
                />
              </div>
              <div>
                <Label>Difficulty</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={localData.difficulty}
                  onChange={(e) => updateField("difficulty", e.target.value)}
                  disabled={!editable}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={localData.description}
                onChange={(e) => updateField("description", e.target.value)}
                disabled={!editable}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
  <Label>Start Time</Label>
  <Input
    type="datetime-local"
    value={toDateTimeLocalFormat(localData.startTime)}
onChange={(e) => updateField("startTime", new Date(e.target.value))}
    disabled={!editable}
  />
</div>
<div>
  <Label>End Time</Label>
  <Input
    type="datetime-local"
    value={toDateTimeLocalFormat(localData.endTime)}
onChange={(e) => updateField("endTime", new Date(e.target.value))}
    disabled={!editable}
  />
</div>

            </div>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Test Cases</CardTitle>
                <p className="text-sm text-muted-foreground">Define input/output</p>
              </div>
              {editable && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>{visibleCount} visible</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <EyeOff className="w-4 h-4 text-gray-500" />
                    <span>{hiddenCount} hidden</span>
                  </div>
                  <Button onClick={addTestCase} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {localData.testCases.map((tc: any, idx: number) => (
              <div key={tc.id} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="outline">Test Case {idx + 1}</Badge>
                  {editable && localData.testCases.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(tc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={tc.isVisible}
                    onCheckedChange={(checked) =>
                      updateTestCase(tc.id, "isVisible", checked)
                    }
                    disabled={!editable}
                  />
                  <span className="text-sm">
                    {tc.isVisible ? "Visible to users" : "Hidden"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Input</Label>
                    <Input
                      value={tc.input}
                      onChange={(e) =>
                        updateTestCase(tc.id, "input", e.target.value)
                      }
                      disabled={!editable}
                    />
                  </div>
                  <div>
                    <Label>Expected Output</Label>
                    <Input
                      value={tc.expected}
                      onChange={(e) =>
                        updateTestCase(tc.id, "expected", e.target.value)
                      }
                      disabled={!editable}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ViewEditQuestion;
