from typing import Any
from langchain.memory import ConversationBufferMemory


class CustomMemory(ConversationBufferMemory):
    def save_context(
        self,
        inputs: dict[str, Any],
        outputs: dict[str, str],
        save_to_memory: bool = True,
        save_to_context: bool = True,
    ) -> None:
        outs = {'output': outputs['output']}
        input_str, output_str = self._get_input_output(inputs, outs)
        self.chat_memory.add_user_message(input_str)
        self.chat_memory.add_ai_message(output_str)