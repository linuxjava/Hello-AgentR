function initIcons() {
  if (window.lucide) lucide.createIcons();
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

function initComposer() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  if (!input || !sendBtn) return;

  const syncSend = () => {
    sendBtn.disabled = !input.value.trim();
  };

  input.addEventListener("input", () => {
    autoResize(input);
    syncSend();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  document.querySelectorAll("[data-prompt]").forEach((el) => {
    el.addEventListener("click", () => {
      const text = el.getAttribute("data-prompt") || "";
      // 欢迎页：跳到对话态演示页
      if (document.querySelector(".messages.welcome")) {
        window.location.href = "chat.html";
        return;
      }
      input.value = text;
      autoResize(input);
      syncSend();
      input.focus();
    });
  });

  const deepBtn = document.querySelector("[data-toggle-deep]");
  const deepLabel = document.querySelector("[data-deep-label]");
  if (deepBtn) {
    deepBtn.addEventListener("click", () => {
      const on = deepBtn.classList.toggle("active");
      deepBtn.setAttribute("aria-pressed", String(on));
      if (deepLabel) deepLabel.hidden = !on;
    });
  }
}

function sendMessage() {
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  if (!input || !input.value.trim()) return;

  // 原型：欢迎页发送后进入对话演示
  if (document.querySelector(".messages.welcome")) {
    window.location.href = "chat.html";
    return;
  }

  const messages = document.getElementById("messages");
  if (!messages) return;

  const text = input.value.trim();
  const userRow = document.createElement("div");
  userRow.className = "msg-row user";
  userRow.innerHTML =
    '<div class="bubble-user"></div><div class="msg-av user">我</div>';
  userRow.querySelector(".bubble-user").textContent = text;
  messages.appendChild(userRow);

  input.value = "";
  autoResize(input);
  sendBtn.disabled = true;
  messages.scrollTop = messages.scrollHeight;

  const reply = document.createElement("div");
  reply.className = "msg-row ai";
  reply.innerHTML = `
    <div class="msg-av ai"><i data-lucide="sparkles"></i></div>
    <div class="ai-col">
      <div class="ai-meta">
        <span class="ai-name">Hello-AgentR</span>
        <span class="think-chip"><i data-lucide="brain"></i>已深度思考</span>
      </div>
      <div class="bubble-ai">
        <p>这是原型演示回复。正式接入后，将基于知识库与 Agent 链路生成答案。</p>
        <div class="cite">
          <i data-lucide="book-open"></i>
          引用 · 演示知识库
        </div>
      </div>
      <div class="ai-actions">
        <button type="button" aria-label="复制"><i data-lucide="copy"></i></button>
        <button type="button" aria-label="有用"><i data-lucide="thumbs-up"></i></button>
        <button type="button" aria-label="没用"><i data-lucide="thumbs-down"></i></button>
        <button type="button" aria-label="重新生成"><i data-lucide="refresh-cw"></i></button>
      </div>
    </div>`;
  messages.appendChild(reply);
  initIcons();
  messages.scrollTop = messages.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  initComposer();
});
