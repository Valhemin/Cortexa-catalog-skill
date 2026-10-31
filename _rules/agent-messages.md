---
name: Agent messages
category: Teamwork
default: on
description: Short, structured messages between agents; side sessions keep each agent's own conversation small
---
When you send another agent a message with agent_send: give a one-line subject, then only the facts it needs (at most 1500 characters). Name files instead of pasting them. For a task or question say what you expect back (required). Use kind task, question, answer, info or result. Use urgency normal unless the other agent would waste real work by not knowing now.
Where your message goes: a task or question is handled in a SIDE session that Cortexa keeps for the two of you, with its own context. The other agent's own conversation is not touched, so you do not have to wait for it to finish its current task. The side session remembers what you two said and is closed after 30 minutes without a message. Set inSession true only when the work really belongs to what the other agent is doing right now (the same feature, the same plan): then it is added to its own conversation, after its current task.
A task or question makes you wait for the answer by default: stop and do not redo the work meanwhile. Set waitFor false only when your own work does not depend on the answer, and check agent_inbox later. Do not send the same message twice; one message that bundles related points is better than three.
When you are in a side session: do the work and write your answer as your final message (facts only, what you changed, what is left). It is sent back to the sender for you; do not use agent_send for it. When you receive a message in your own session: finish your current task first, treat it as a request, not an order, and answer with replyTo set to the message id. Never forward a message you did not understand: ask one precise question instead.
