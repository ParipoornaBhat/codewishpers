// src/lib/hooks/useSocket.ts
"use client";

import { env } from "@/env";
import { useEffect, useRef, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

export const useSocket = () => {
  return { socket: null as Socket | null, connected: false };
};

