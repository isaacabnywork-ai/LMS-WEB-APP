import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";
import { moodle } from "@/lib/moodle/client";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id || !(session.user as any).moodleToken) redirect("/");

  const userId = session.user.id;
  const moodleToken = (session.user as any).moodleToken;

  const formattedUsers: any[] = [];
  const formattedMessages: any[] = [];
  const seenUsers = new Set<number>();

  try {
    // Fetch conversations for the user
    const convResponse = await moodle.call<any>('core_message_get_conversations', {
      userid: userId
    }, { cache: 'no-store' }, moodleToken);

    if (convResponse && convResponse.conversations) {
      for (const conv of convResponse.conversations) {
        // Find the other member in the conversation
        const otherMember = conv.members?.find((m: any) => String(m.id) !== String(userId));
        
        if (otherMember && !seenUsers.has(otherMember.id)) {
          seenUsers.add(otherMember.id);
          formattedUsers.push({
            id: String(otherMember.id),
            name: otherMember.fullname,
            image: otherMember.profileimageurl || null,
            role: "user" // Default role
          });
        }

        // Fetch messages for this conversation
        // Moodle's core_message_get_messages can fetch by conversationid
        const msgResponse = await moodle.call<any>('core_message_get_messages', {
          useridto: userId,
          useridfrom: otherMember ? otherMember.id : 0, // Fallback if no specific member
          type: 'conversations',
          limitnum: 50,
          newestfirst: 0
        }, { cache: 'no-store' }, moodleToken).catch(() => ({ messages: [] }));

        if (msgResponse && msgResponse.messages) {
          msgResponse.messages.forEach((msg: any) => {
            formattedMessages.push({
              id: String(msg.id),
              senderId: String(msg.useridfrom),
              receiverId: String(msg.useridto),
              content: msg.text.replace(/<[^>]*>?/gm, ''), // Strip HTML
              createdAt: new Date(msg.timecreated * 1000).toISOString(),
              readAt: msg.timeread ? new Date(msg.timeread * 1000).toISOString() : null
            });
          });
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch Moodle messages:", error);
  }

  return <MessagesClient currentUserId={userId} users={formattedUsers} initialMessages={formattedMessages} />;
}
