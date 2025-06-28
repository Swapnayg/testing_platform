/* eslint-disable @next/next/no-async-client-component */
import React from 'react';
import { auth,getAuth, clerkClient } from "@clerk/nextjs/server";
import StudentResultsList from '@/components/StudentResult';

export default async function StudentResult() {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;
  const client = clerkClient();

  let user = null;
  var username = "";
  if (userId) {
    user = await client.users.getUser(userId);
    username = user.username?.toString() ?? "";
  }

  return (
    <StudentResultsList username={username} />
  );
};

