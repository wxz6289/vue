<template>
  <div class="chat-container">
    <div class="messages">
      <div v-for="(msg, idx) in messages" :key="idx" :class="msg.role">
        <span>{{ msg.role === "user" ? "你" : "DeepSeek" }}：</span>
        <span v-if="idx !== messages.length - 1 || msg.role === 'user'">
          {{ msg.content }}
        </span>
        <span v-else-if="msg.role === 'assistant'">
          <!-- AI输出动效：逐字显示 -->
          <span>{{ animatedReply }}</span>
          <span v-if="loading" class="cursor">▋</span>
        </span>
      </div>
    </div>
    <form @submit.prevent="sendMessage">
      <input v-model="input" placeholder="请输入你的问题..." />
      <button :disabled="loading">发送</button>
    </form>
    <div v-if="loading" class="loading">正在思考...</div>
  </div>
</template>

<script setup>
  import { ref, nextTick } from "vue";

  // interface Message {
  //   role: "user" | "assistant";
  //   content: string;
  // }

  const messages = ref([]);
  const input = ref("");
  const loading = ref(false);
  const animatedReply = ref("");

  // DeepSeek API 接口地址与API KEY
  const API_URL = "https://api.deepseek.com/v1/chat/completions";
  const API_KEY = "sk-16c0a1c8b9824d37910111a86214a31e";

  async function sendMessage() {
    if (!input.value.trim()) return;
    messages.value.push({ role: "user", content: input.value });
    loading.value = true;
    animatedReply.value = "";

    const body = {
      model: "deepseek-chat",
      messages: messages.value.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "未获取到回复";
      messages.value.push({ role: "assistant", content: reply });
      await nextTick();
      await typeEffect(reply);
    } catch (e) {
      const errorMsg = "请求出错，请稍后重试。";
      messages.value.push({ role: "assistant", content: errorMsg });
      animatedReply.value = errorMsg;
    } finally {
      input.value = "";
      loading.value = false;
    }
  }

  // 输出动效：逐字显示
  async function typeEffect(text) {
    animatedReply.value = "";
    for (let i = 0; i < text.length; i++) {
      animatedReply.value += text[i];
      await sleep(text[i] === " " ? 0 : 25 + Math.random() * 30);
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
</script>

<style scoped>
  .chat-container {
    width: 400px;
    margin: 0 auto;
    font-family: "Helvetica Neue", Arial, sans-serif;
  }
  .messages {
    min-height: 300px;
    max-height: 400px;
    overflow-y: auto;
    background: #f7f7f7;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 8px;
  }
  .user {
    text-align: right;
    color: #1e88e5;
    margin: 5px 0;
  }
  .assistant {
    text-align: left;
    color: #43a047;
    margin: 5px 0;
  }
  form {
    display: flex;
    gap: 6px;
  }
  input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  button {
    padding: 8px 15px;
    border: none;
    background: #1e88e5;
    color: #fff;
    border-radius: 6px;
    cursor: pointer;
  }
  button:disabled {
    background: #90caf9;
    cursor: not-allowed;
  }
  .loading {
    text-align: center;
    color: #888;
    margin-top: 8px;
  }
  .cursor {
    animation: blink 1s steps(2, start) infinite;
    font-weight: bold;
    color: #43a047;
  }
  @keyframes blink {
    to {
      opacity: 0;
    }
  }
</style>
