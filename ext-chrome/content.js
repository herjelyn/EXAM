(function () {
  if (document.getElementById("chat-everywhere")) return;

  // =====================================================
  // THEMES
  // =====================================================

  const LIGHT = {
    bg: "#ffffff",
    text: "#40374b",
    muted: "#8b829a",
    border: "#eadff5",
    bubble: "#f3effa"
  };

  const THEMES = {
    Grape: { a: "#6a3de8", b: "#c04ee0", c: "#ff6fae", accent: "#6a3de8", soft: "#f1ebff" },
    Candy: { a: "#ff4f93", b: "#ff8a5c", c: "#ffc371", accent: "#ff4f93", soft: "#fff0f5" },
    Ocean: { a: "#0ea5e9", b: "#6366f1", c: "#22d3ee", accent: "#0f8fd6", soft: "#e8f6ff" },
    Mint: { a: "#10b981", b: "#06b6d4", c: "#84cc16", accent: "#0d9f6e", soft: "#e6faf3" },
    Sunset: { a: "#f97316", b: "#ef4444", c: "#ec4899", accent: "#ea580c", soft: "#fff1e6" },
    Midnight: {
      a: "#1e1b4b", b: "#4338ca", c: "#a855f7", accent: "#a78bfa", soft: "#2a2650",
      bg: "#181629", text: "#ece9ff", muted: "#9a96c0", border: "#3a3566", bubble: "#26234a"
    }
  };

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem("ce-" + key);
        return v === null ? fallback : v;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem("ce-" + key, value); } catch {}
    },
    remove(key) {
      try { localStorage.removeItem("ce-" + key); } catch {}
    }
  };

  // =====================================================
  // BUILD UI
  // =====================================================

  const launcher = document.createElement("button");
  launcher.id = "ce-launcher";
  launcher.className = "ce-hidden";
  launcher.setAttribute("aria-label", "Open Chat Everywhere");
  launcher.innerHTML = '💬<span class="ce-launcher-dot"></span>';

  const container = document.createElement("div");
  container.id = "chat-everywhere";

  container.innerHTML = `
    <div class="ce-header">
      <div class="ce-header-left">
        <div class="ce-logo">💬</div>
        <div>
          <div class="ce-title">Chat Everywhere</div>
          <div class="ce-status"><span></span> Online · drag me anywhere</div>
        </div>
      </div>
      <button id="ce-close" class="ce-close" aria-label="Minimize">–</button>
    </div>

    <div class="ce-tabs">
      <button class="ce-tab active" data-tab="chat"><span>💬</span>Chat</button>
      <button class="ce-tab" data-tab="media"><span>🖼️</span>Media</button>
      <button class="ce-tab" data-tab="groups"><span>👥</span>Groups</button>
      <button class="ce-tab" data-tab="shares"><span>✨</span>Shares</button>
      <button class="ce-tab" data-tab="tools"><span>🛠️</span>Tools</button>
      <button class="ce-tab" data-tab="style"><span>🎨</span>Style</button>
    </div>

    <div class="ce-content" id="ce-scroll">

      <!-- CHAT -->
      <div class="ce-page active" id="ce-chat">
        <div class="ce-welcome">
          <div class="ce-welcome-icon">💜</div>
          <div>
            <strong>Hey there! 👋</strong>
            <p>Tap a message to react. Paste a link, image URL or YouTube link!</p>
          </div>
        </div>
        <div id="ce-messages"></div>
      </div>

      <!-- MEDIA -->
      <div class="ce-page" id="ce-media">
        <div class="ce-page-title"><span>🌷</span> Little Memories</div>
        <p class="ce-description">Tap a photo to view it. Tap ♥ to like.</p>
        <div class="ce-media-grid" id="ce-media-grid"></div>
      </div>

      <!-- GROUPS -->
      <div class="ce-page" id="ce-groups">
        <div class="ce-page-title"><span>🫶</span> Your Groups</div>
        <p class="ce-description">Tap a group to open the conversation.</p>
        <div id="ce-group-list"></div>
        <button class="ce-btn ce-btn-wide" id="ce-new-group">➕ New group</button>
      </div>

      <!-- SHARES -->
      <div class="ce-page" id="ce-shares">
        <div class="ce-page-title"><span>✨</span> Shared With You</div>
        <p class="ce-description">Tap an item to copy its name.</p>
        <div id="ce-share-list"></div>
      </div>

      <!-- TOOLS -->
      <div class="ce-page" id="ce-tools">
        <div id="ce-tool-list">
          <div class="ce-page-title"><span>🛠️</span> Useful Tools</div>
          <p class="ce-description">Handy tools for your everyday tasks.</p>
          <div id="ce-tool-items"></div>
        </div>
        <div id="ce-tool-workspace" class="ce-tool-workspace">
          <button class="ce-back" id="ce-tool-back">‹ Back</button>
          <div id="ce-tool-title" class="ce-tool-title"></div>
          <div id="ce-tool-content"></div>
        </div>
      </div>

      <!-- STYLE -->
      <div class="ce-page" id="ce-style">
        <div class="ce-page-title"><span>🎨</span> Make It Yours</div>
        <p class="ce-description">Pick a color theme.</p>
        <div class="ce-theme-grid" id="ce-theme-grid"></div>

        <div class="ce-setting">
          <div>
            <strong>Auto replies</strong>
            <p>Friends answer your messages</p>
          </div>
          <label class="ce-switch">
            <input type="checkbox" id="ce-auto-reply">
            <span></span>
          </label>
        </div>

        <div class="ce-btn-row">
          <button class="ce-btn" id="ce-confetti">🎉 Confetti</button>
          <button class="ce-btn ce-btn-soft" id="ce-clear-chat">🧹 Clear chat</button>
        </div>
      </div>

    </div>

    <div class="ce-attach-preview" id="ce-attach-preview"></div>

    <div class="ce-emoji-panel" id="ce-emoji-panel"></div>

    <div class="ce-drop"><span>🎬</span>Drop your photo or video here</div>

    <div class="ce-input-area">
      <input id="ce-file-input" type="file" accept="video/*,image/*" hidden>
      <button id="ce-attach" class="ce-attach" type="button" aria-label="Attach photo or video">📎</button>
      <div class="ce-input-wrapper">
        <input id="ce-message-input" type="text" placeholder="Write something cute..." autocomplete="off">
        <button id="ce-emoji" type="button" aria-label="Emoji">😊</button>
      </div>
      <button id="ce-send" class="ce-send" aria-label="Send"><span>➤</span></button>
    </div>

    <div class="ce-lightbox" id="ce-lightbox">
      <button class="ce-lightbox-close" id="ce-lightbox-close" aria-label="Close">×</button>
      <div id="ce-lightbox-body"></div>
    </div>

    <div class="ce-toast" id="ce-toast"></div>
  `;

  document.body.appendChild(container);
  document.body.appendChild(launcher);

  const $ = (sel) => container.querySelector(sel);
  const $$ = (sel) => container.querySelectorAll(sel);

  const scroller = $("#ce-scroll");
  const messages = $("#ce-messages");
  const input = $("#ce-message-input");

  // =====================================================
  // HELPERS
  // =====================================================

  let toastTimer;
  function toast(text) {
    const el = $("#ce-toast");
    el.textContent = text;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function scrollDown() {
    scroller.scrollTop = scroller.scrollHeight;
  }

  function isValidURL(text) {
    try {
      const url = new URL(text);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function isImageURL(text) {
    return isValidURL(text) && /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(text);
  }

  // YouTube links only (plain words are never treated as video IDs)
  function getYouTubeVideoId(text) {
    try {
      const url = new URL(text.trim());
      const host = url.hostname.replace(/^www\./, "");

      if (host === "youtu.be") {
        return url.pathname.substring(1).split("/")[0] || null;
      }

      if (host.endsWith("youtube.com")) {
        const v = url.searchParams.get("v");
        if (v) return v;

        const parts = url.pathname.split("/");
        for (const key of ["shorts", "embed"]) {
          const i = parts.indexOf(key);
          if (i !== -1 && parts[i + 1]) return parts[i + 1];
        }
      }
    } catch {}
    return null;
  }

  function makeVideoFrame(id) {
    const wrap = document.createElement("div");
    wrap.className = "ce-sent-video";

    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(id);
    iframe.title = "YouTube video";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.setAttribute("allowfullscreen", "");

    wrap.appendChild(iframe);
    return wrap;
  }

  // =====================================================
  // CONFETTI
  // =====================================================

  function confetti() {
    const colors = ["#ff4f93", "#ffc371", "#6a3de8", "#22d3ee", "#84cc16", "#f97316"];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("i");
      piece.className = "ce-confetti";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.4 + "s";
      piece.style.animationDuration = 1.2 + Math.random() * 1 + "s";
      piece.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 2600);
    }
  }

  // =====================================================
  // THEMES
  // =====================================================

  function applyTheme(name) {
    const theme = Object.assign({}, LIGHT, THEMES[name] || THEMES.Grape);
    for (const key in theme) {
      container.style.setProperty("--ce-" + key, theme[key]);
    }
    launcher.style.setProperty("--ce-a", theme.a);
    launcher.style.setProperty("--ce-b", theme.b);
    launcher.style.setProperty("--ce-c", theme.c);
    store.set("theme", name);

    $$(".ce-theme").forEach((el) => {
      el.classList.toggle("active", el.dataset.theme === name);
    });
  }

  const themeGrid = $("#ce-theme-grid");

  Object.keys(THEMES).forEach((name) => {
    const t = THEMES[name];
    const btn = document.createElement("button");
    btn.className = "ce-theme";
    btn.dataset.theme = name;
    btn.innerHTML =
      '<span class="ce-swatch" style="background:linear-gradient(135deg,' +
      t.a + "," + t.b + "," + t.c + ')"></span>' + name;
    btn.addEventListener("click", () => {
      applyTheme(name);
      confetti();
    });
    themeGrid.appendChild(btn);
  });

  applyTheme(store.get("theme", "Grape"));

  // =====================================================
  // TABS
  // =====================================================

  const tabs = $$(".ce-tab");
  const pages = $$(".ce-page");

  function openTab(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    pages.forEach((p) => p.classList.toggle("active", p.id === "ce-" + name));
    scroller.scrollTop = name === "chat" ? scroller.scrollHeight : 0;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => openTab(tab.dataset.tab));
  });

  // =====================================================
  // CHAT
  // =====================================================

  const AVATARS = { anna: "A", john: "J", maria: "M", you: "Y" };
  const REACTIONS = ["", "❤️", "😂", "👍", "🎉"];

  function renderContent(bubble, text) {
    const youtubeId = getYouTubeVideoId(text);

    if (youtubeId) {
      bubble.appendChild(makeVideoFrame(youtubeId));

      const link = document.createElement("a");
      link.href = text.startsWith("http")
        ? text
        : "https://www.youtube.com/watch?v=" + encodeURIComponent(youtubeId);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open video";
      link.className = "ce-video-link";
      bubble.appendChild(link);
    } else if (isImageURL(text)) {
      const img = document.createElement("img");
      img.src = text;
      img.alt = "Shared image";
      img.className = "ce-sent-image";
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        showLightbox(img.cloneNode());
      });
      bubble.appendChild(img);
    } else if (isValidURL(text)) {
      const link = document.createElement("a");
      link.href = text;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = text;
      link.className = "ce-sent-link";
      bubble.appendChild(link);
    } else {
      bubble.textContent = text;
    }
  }

  function addMessage(who, text, options) {
    options = options || {};
    const key = who.toLowerCase();
    const isMe = key === "you";

    const message = document.createElement("div");
    message.className = "ce-message" + (isMe ? " ce-you" : "");

    const avatar = document.createElement("div");
    avatar.className = "ce-avatar " + (AVATARS[key] ? key : "group");
    avatar.textContent = AVATARS[key] || who.charAt(0).toUpperCase();

    const body = document.createElement("div");
    body.className = "ce-message-text";

    const name = document.createElement("strong");
    name.textContent = who;

    const bubble = document.createElement("div");
    bubble.className = "ce-bubble";
    if (options.media) {
      bubble.classList.add("ce-has-media");
      renderMedia(bubble, options.media);
    }
    if (text) renderContent(bubble, text);

    const reaction = document.createElement("span");
    reaction.className = "ce-reaction";

    const time = document.createElement("small");
    time.textContent = options.time || nowTime();

    let reactionIndex = 0;
    bubble.addEventListener("click", () => {
      reactionIndex = (reactionIndex + 1) % REACTIONS.length;
      reaction.textContent = REACTIONS[reactionIndex];
      reaction.classList.toggle("show", reactionIndex !== 0);
    });

    body.appendChild(name);
    body.appendChild(bubble);
    body.appendChild(reaction);
    body.appendChild(time);
    message.appendChild(avatar);
    message.appendChild(body);

    const typing = $("#ce-typing");
    if (typing) messages.insertBefore(message, typing);
    else messages.appendChild(message);

    scrollDown();
    return message;
  }

  // initial conversation
  addMessage("Anna", "Hello! How are you? 😊", { time: "10:02 AM" });
  addMessage("John", "Are you available later? 🌸", { time: "10:05 AM" });
  addMessage("You", "you 💜", { time: "Now" });

  // typing indicator + auto reply
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // Friends answer based on what you wrote (English + a little Taglish)
  const RULES = [
    {
      test: /how are you|how r u|\bhru\b|kumusta ka|musta ka/i,
      replies: [
        "I'm good! Just chilling 😄 how about you?",
        "Doing great today! ✨ ikaw, kumusta?",
        "Pretty good, a bit tired lang haha 😅 you?"
      ]
    },
    {
      test: /\b(hi|hello|hey|heyy|yo|hola|kumusta|musta)\b/i,
      replies: [
        "Heyyy! 👋 Buti nag-chat ka!",
        "Hi hi! 😊 What's up?",
        "Hello! Miss na kita 💜",
        "Yooo! 🌸 How's your day?"
      ]
    },
    {
      test: /\b(thanks|thank you|thx|ty|salamat)\b/i,
      replies: [
        "Walang anuman! 💕",
        "Anytime! That's what friends are for 🥰",
        "No problem at all 😊"
      ]
    },
    {
      test: /\b(love you|love|miss you|miss|mahal)\b/i,
      replies: [
        "Aww I love you too! 💖",
        "Stop, you're making me blush 🥹",
        "Miss you more!! 💜"
      ]
    },
    {
      test: /\b(bye|goodbye|good night|goodnight|gn|see you|see ya|cya|ingat|paalam)\b/i,
      replies: [
        "Bye! Ingat ka ha 👋💜",
        "Goodnight! Sleep well 🌙",
        "See you later! 😊"
      ]
    },
    {
      test: /\b(sorry|my bad|pasensya)\b/i,
      replies: [
        "It's okay, don't worry about it 💕",
        "No worries! We're good 😊"
      ]
    },
    {
      test: /\b(sad|tired|bored|sleepy|stress|stressed|pagod|inaantok|lungkot|malungkot|nakakabagot)\b/i,
      replies: [
        "Aww, I'm here for you 🤗 want to talk about it?",
        "Rest ka muna, you deserve it 🌷",
        "Sending you a big hug 🫶 it'll get better!"
      ]
    },
    {
      test: /\b(food|eat|eating|hungry|lunch|dinner|breakfast|pizza|coffee|kain|gutom|kape)\b/i,
      replies: [
        "Ooh, I'm hungry too now 🍕",
        "Let's eat together later! 😋",
        "Coffee muna? ☕ my treat!"
      ]
    },
    {
      test: /\b(free|available|later|tonight|tomorrow|meet|hang out|hangout|labas|mamaya|bukas)\b/i,
      replies: [
        "Yes, I'm free later! What time? ⏰",
        "Sure, sounds like a plan! 🎉",
        "Mamaya okay lang, just tell me where 📍"
      ]
    },
    {
      test: /(haha|hehe|lol|lmao|😂|🤣)/i,
      replies: [
        "HAHAHA stop 😂😂",
        "I can't!! 🤣",
        "Haha you're so funny 😆"
      ]
    },
    {
      test: /\b(ok|okay|sige|sure|yes|yeah|yep|oo|opo)\b/i,
      replies: [
        "Yay! 🎉",
        "Great, sige! 👍",
        "Perfect! 😊"
      ]
    },
    {
      test: /\b(no|nope|ayoko|hindi)\b/i,
      replies: [
        "Awww, why not? 🥺",
        "Okay okay, maybe next time 😅"
      ]
    }
  ];

  const LINK_REPLIES = [
    "Ooh what's that? 👀",
    "Checking it out now! 🔍",
    "Nice share! ✨",
    "Wow, ang ganda! 😍"
  ];

  const QUESTION_REPLIES = [
    "Hmm, good question 🤔 I think yes!",
    "Honestly? Not sure pa 😅 what do you think?",
    "Ooh, let me think about it... 💭",
    "Yes naman! 😄"
  ];

  const FALLBACK_REPLIES = [
    "Wait, tell me more! 👀",
    "Omg really?! 😮",
    "That's so true 💯",
    "Aww, that's nice 💖",
    "Hahaha ikaw talaga 😂",
    "Then what happened? 🍿",
    "I feel you! 🫶"
  ];

  const FOLLOW_UPS = ["Same! 💯", "Ikr 😆", "Haha agree! 😂", "Aww 💖", "Totoo! 🙌"];

  const VIDEO_REPLIES = [
    "Omg that video! 😍 so cute",
    "Watching it now 🍿",
    "HAHA nice one! 🎬",
    "Send more! 😆"
  ];

  const PHOTO_REPLIES = [
    "Wow, ang ganda ng photo! 📸",
    "Love this one 😍",
    "Cute!! Can I save it? 💖"
  ];

  function buildReply(text, kind) {
    if (kind === "video") return pick(VIDEO_REPLIES);
    if (kind === "image") return pick(PHOTO_REPLIES);
    if (isValidURL(text.trim())) return pick(LINK_REPLIES);

    for (const rule of RULES) {
      if (rule.test.test(text)) return pick(rule.replies);
    }

    if (text.includes("?")) return pick(QUESTION_REPLIES);

    // echo a short message back so it feels like they read it
    if (text.length <= 25 && Math.random() < 0.4) {
      return "\"" + text + "\"? 😄 tell me more!";
    }

    return pick(FALLBACK_REPLIES);
  }

  function showTyping(name) {
    hideTyping();
    const el = document.createElement("div");
    el.id = "ce-typing";
    el.className = "ce-typing";
    el.innerHTML =
      "<em>" + name + " is typing</em><span></span><span></span><span></span>";
    messages.appendChild(el);
    scrollDown();
  }

  function hideTyping() {
    const el = $("#ce-typing");
    if (el) el.remove();
  }

  const autoReply = $("#ce-auto-reply");
  autoReply.checked = store.get("auto-reply", "1") === "1";
  autoReply.addEventListener("change", () => {
    store.set("auto-reply", autoReply.checked ? "1" : "0");
    toast(autoReply.checked ? "Auto replies on 💬" : "Auto replies off");
  });

  let lastFriend = "John";

  function maybeReply(text, kind) {
    if (!autoReply.checked) return;

    // the friends take turns answering
    const friend = lastFriend === "Anna" ? "John" : "Anna";
    const other = friend === "Anna" ? "John" : "Anna";
    lastFriend = friend;

    const reply = buildReply(text, kind);
    const startDelay = 500 + Math.random() * 600;
    const typingTime = Math.min(2600, 700 + reply.length * 35);

    setTimeout(() => {
      showTyping(friend);

      setTimeout(() => {
        hideTyping();
        addMessage(friend, reply);

        // sometimes the other friend jumps into the conversation
        if (Math.random() < 0.3) {
          setTimeout(() => {
            showTyping(other);
            setTimeout(() => {
              hideTyping();
              addMessage(other, pick(FOLLOW_UPS));
            }, 900);
          }, 800);
        }
      }, typingTime);
    }, startDelay);
  }

  // ---------- photo / video attachments ----------

  let pending = null;
  const fileInput = $("#ce-file-input");
  const preview = $("#ce-attach-preview");

  function renderMedia(bubble, media) {
    if (media.type === "video") {
      const video = document.createElement("video");
      video.src = media.url + "#t=0.1";
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      video.className = "ce-sent-file";
      video.addEventListener("click", (e) => e.stopPropagation());
      bubble.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = media.url;
      img.alt = media.name || "Photo";
      img.className = "ce-sent-image";
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        showLightbox(img.cloneNode());
      });
      bubble.appendChild(img);
    }
  }

  function clearPreview() {
    preview.innerHTML = "";
    preview.classList.remove("open");
  }

  function removePending() {
    if (pending) URL.revokeObjectURL(pending.url);
    pending = null;
    clearPreview();
  }

  function setAttachment(file) {
    if (!file) return;

    const type = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
        ? "image"
        : null;

    if (!type) {
      toast("Only photos and videos please 📎");
      return;
    }

    removePending();
    pending = { url: URL.createObjectURL(file), type: type, name: file.name };

    const thumb = document.createElement(type === "video" ? "video" : "img");
    thumb.className = "ce-attach-thumb";
    if (type === "video") {
      thumb.src = pending.url + "#t=0.1";
      thumb.muted = true;
      thumb.preload = "metadata";
    } else {
      thumb.src = pending.url;
    }

    const label = document.createElement("span");
    label.className = "ce-attach-name";
    label.textContent = (type === "video" ? "🎥 " : "🖼️ ") + file.name;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove attachment");
    remove.addEventListener("click", removePending);

    preview.appendChild(thumb);
    preview.appendChild(label);
    preview.appendChild(remove);
    preview.classList.add("open");

    openTab("chat");
    input.focus();
  }

  $("#ce-attach").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    setAttachment(fileInput.files[0]);
    fileInput.value = "";
  });

  // paste a photo/video into the input
  input.addEventListener("paste", (e) => {
    const file = e.clipboardData && e.clipboardData.files[0];
    if (file) {
      e.preventDefault();
      setAttachment(file);
    }
  });

  // drag & drop onto the chat window
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
    container.classList.add("ce-dragging");
  });

  container.addEventListener("dragleave", (e) => {
    if (!container.contains(e.relatedTarget)) {
      container.classList.remove("ce-dragging");
    }
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    container.classList.remove("ce-dragging");
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) setAttachment(file);
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text && !pending) return;

    openTab("chat");

    const media = pending;
    pending = null; // keep the file URL alive so it stays visible in the chat
    clearPreview();

    addMessage("You", text, { media: media });
    input.value = "";
    $("#ce-emoji-panel").classList.remove("open");
    maybeReply(text, media ? media.type : null);
  }

  $("#ce-send").addEventListener("click", sendMessage);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  // emoji picker
  const emojiPanel = $("#ce-emoji-panel");
  const EMOJIS = [
    "😊", "😂", "🥰", "😍", "😎", "🤩", "😜", "🥳",
    "😭", "😴", "🤔", "🙌", "👍", "👏", "🙏", "💪",
    "💜", "💖", "💙", "💚", "🧡", "🔥", "✨", "🌈",
    "🌸", "🌷", "🍕", "🍰", "☕", "🎉", "🎵", "🚀"
  ];

  EMOJIS.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = emoji;
    btn.addEventListener("click", () => {
      input.value += emoji;
      input.focus();
    });
    emojiPanel.appendChild(btn);
  });

  $("#ce-emoji").addEventListener("click", () => {
    emojiPanel.classList.toggle("open");
  });

  // =====================================================
  // LIGHTBOX
  // =====================================================

  const lightbox = $("#ce-lightbox");
  const lightboxBody = $("#ce-lightbox-body");

  function showLightbox(node) {
    lightboxBody.innerHTML = "";
    lightboxBody.appendChild(node);
    lightbox.classList.add("open");
  }

  function hideLightbox() {
    lightbox.classList.remove("open");
    lightboxBody.innerHTML = "";
  }

  $("#ce-lightbox-close").addEventListener("click", hideLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) hideLightbox();
  });

  // =====================================================
  // MEDIA
  // =====================================================

  const mediaGrid = $("#ce-media-grid");

  [21, 22, 23, 24, 25].forEach((n) => {
    const item = document.createElement("div");
    item.className = "ce-media-item ce-clickable-media";

    const img = document.createElement("img");
    img.src = "https://picsum.photos/300/200?random=" + n;
    img.alt = "Memory";

    const heart = document.createElement("button");
    heart.className = "ce-media-heart";
    heart.textContent = "♥";
    heart.setAttribute("aria-label", "Like");
    heart.addEventListener("click", (e) => {
      e.stopPropagation();
      heart.classList.toggle("liked");
    });

    item.addEventListener("click", () => {
      const big = document.createElement("img");
      big.src = "https://picsum.photos/800/600?random=" + n;
      big.alt = "Memory";
      showLightbox(big);
    });

    item.appendChild(img);
    item.appendChild(heart);
    mediaGrid.appendChild(item);
  });

  const videoTile = document.createElement("div");
  videoTile.className = "ce-media-item ce-video";
  videoTile.innerHTML = "<span>▶</span><small>Watch Video</small>";
  videoTile.addEventListener("click", () => {
    const url = prompt("Paste a YouTube video link:");
    if (!url) return;

    const id = getYouTubeVideoId(url);
    if (!id) {
      toast("Please enter a valid YouTube link");
      return;
    }

    const frame = makeVideoFrame(id);
    frame.classList.add("ce-lightbox-video");
    showLightbox(frame);
  });
  mediaGrid.appendChild(videoTile);

  // =====================================================
  // GROUPS
  // =====================================================

  const groupList = $("#ce-group-list");
  const GROUP_ICONS = ["🏡", "🎀", "☕", "🎮", "🍕", "🎵", "⚽", "🌍"];
  const GROUP_COLORS = ["#fff0dc", "#ffe7f1", "#eee8ff", "#e1f7ee", "#e1f1ff", "#fff7cc"];

  function addGroup(name, icon, color, preview, unread) {
    const group = document.createElement("div");
    group.className = "ce-group";
    group.dataset.group = name;

    const iconEl = document.createElement("div");
    iconEl.className = "ce-group-icon";
    iconEl.style.background = color;
    iconEl.textContent = icon;

    const info = document.createElement("div");
    info.className = "ce-group-info";

    const title = document.createElement("strong");
    title.textContent = name;

    const sub = document.createElement("p");
    sub.textContent = preview;

    info.appendChild(title);
    info.appendChild(sub);

    const badge = document.createElement("span");
    badge.className = "ce-badge";
    badge.textContent = unread || "";
    if (!unread) badge.style.display = "none";

    const arrow = document.createElement("span");
    arrow.className = "ce-arrow";
    arrow.textContent = "›";

    group.appendChild(iconEl);
    group.appendChild(info);
    group.appendChild(badge);
    group.appendChild(arrow);
    groupList.appendChild(group);
  }

  addGroup("Family Group", "🏡", "#fff0dc", "Maria: See you later! 💕", 2);
  addGroup("School Group", "🎀", "#ffe7f1", "John: Don't forget our project.", 1);
  addGroup("Work Group", "☕", "#eee8ff", "Meeting at 2 PM.", 0);

  groupList.addEventListener("click", (e) => {
    const group = e.target.closest(".ce-group");
    if (!group) return;

    const badge = group.querySelector(".ce-badge");
    badge.style.display = "none";

    openTab("chat");
    addMessage(group.dataset.group, "You opened the " + group.dataset.group + " 💜");
  });

  $("#ce-new-group").addEventListener("click", () => {
    const name = prompt("Name your new group:");
    if (!name || !name.trim()) return;

    const icon = GROUP_ICONS[Math.floor(Math.random() * GROUP_ICONS.length)];
    const color = GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)];
    addGroup(name.trim().slice(0, 30), icon, color, "Say hi to everyone 👋", 0);
    toast("Group created 🎉");
  });

  // =====================================================
  // SHARES
  // =====================================================

  const SHARES = [
    { name: "Vacation.jpg", by: "Anna", icon: "🖼️", cls: "image" },
    { name: "School Video.mp4", by: "John", icon: "🎥", cls: "video" },
    { name: "Project.pdf", by: "Maria", icon: "📄", cls: "pdf" }
  ];

  const shareList = $("#ce-share-list");

  SHARES.forEach((s) => {
    const el = document.createElement("div");
    el.className = "ce-share ce-share-click";

    el.innerHTML =
      '<div class="ce-file-icon ' + s.cls + '">' + s.icon + "</div>" +
      '<div class="ce-share-info"><strong></strong><p></p></div>' +
      '<span class="ce-share-arrow">⧉</span>';

    el.querySelector("strong").textContent = s.name;
    el.querySelector("p").textContent = "Shared by " + s.by;

    el.addEventListener("click", () => {
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(s.name)
          .then(() => toast(s.name + " copied 📋"))
          .catch(() => toast("Selected: " + s.name));
      } else {
        toast("Selected: " + s.name);
      }
    });

    shareList.appendChild(el);
  });

  // =====================================================
  // TOOLS
  // =====================================================

  const toolList = $("#ce-tool-list");
  const toolWorkspace = $("#ce-tool-workspace");
  const toolContent = $("#ce-tool-content");
  const toolTitle = $("#ce-tool-title");
  let toolCleanup = null;

  function closeTool() {
    if (toolCleanup) {
      toolCleanup();
      toolCleanup = null;
    }
    toolContent.innerHTML = "";
    toolWorkspace.style.display = "none";
    toolList.style.display = "block";
  }

  function openTool(tool) {
    closeTool();
    toolList.style.display = "none";
    toolWorkspace.style.display = "block";
    toolTitle.textContent = tool.icon + " " + tool.title;
    toolContent.innerHTML = tool.html;
    toolCleanup = tool.init() || null;
    scroller.scrollTop = 0;
  }

  $("#ce-tool-back").addEventListener("click", closeTool);

  // ---------- Calculator ----------

  function evaluate(exp) {
    exp = exp.replace(/\s+/g, "");
    if (!exp) return 0;

    const raw = exp.match(/\d+\.?\d*|\.\d+|[+\-*/]/g);
    if (!raw || raw.join("") !== exp) throw new Error("Invalid expression");

    // leading minus
    if (raw[0] === "-" && raw.length > 1) {
      raw.splice(0, 2, "-" + raw[1]);
    }

    const tokens = raw.map((t, i) => {
      if (i % 2 === 0) {
        const n = Number(t);
        if (Number.isNaN(n)) throw new Error("Invalid number");
        return n;
      }
      if (!/^[+\-*/]$/.test(t)) throw new Error("Invalid expression");
      return t;
    });

    if (tokens.length % 2 === 0) throw new Error("Incomplete expression");

    // multiplication / division
    const stack = [tokens[0]];
    for (let i = 1; i < tokens.length; i += 2) {
      const op = tokens[i];
      const next = tokens[i + 1];

      if (op === "*") {
        stack.push(stack.pop() * next);
      } else if (op === "/") {
        if (next === 0) throw new Error("Cannot divide by zero");
        stack.push(stack.pop() / next);
      } else {
        stack.push(op, next);
      }
    }

    // addition / subtraction
    let result = stack[0];
    for (let i = 1; i < stack.length; i += 2) {
      result = stack[i] === "+" ? result + stack[i + 1] : result - stack[i + 1];
    }
    return result;
  }

  const CALC_KEYS = [
    ["7"], ["8"], ["9"], ["/", "÷", "op"],
    ["4"], ["5"], ["6"], ["*", "×", "op"],
    ["1"], ["2"], ["3"], ["-", "−", "op"],
    ["0"], ["."], ["clear", "C", "clear"], ["+", "+", "op"]
  ];

  function calculatorHTML() {
    return (
      '<input id="ce-calc-display" class="ce-calc-display" type="text" placeholder="0" readonly>' +
      '<div class="ce-calc-buttons">' +
      CALC_KEYS.map((k) =>
        '<button class="' + (k[2] || "") + '" data-calc="' + k[0] + '">' + (k[1] || k[0]) + "</button>"
      ).join("") +
      '<button class="eq" data-calc="=">=</button></div>'
    );
  }

  function calculatorInit() {
    const display = $("#ce-calc-display");
    let expression = "";

    $$("[data-calc]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.calc;

        if (value === "clear") {
          expression = "";
          display.value = "";
          return;
        }

        if (value === "=") {
          try {
            if (!expression) {
              display.value = "0";
              return;
            }
            const result = evaluate(expression);
            if (!Number.isFinite(result)) throw new Error("Invalid result");
            const rounded = Math.round((result + Number.EPSILON) * 1e8) / 1e8;
            display.value = rounded;
            expression = String(rounded);
          } catch {
            display.value = "Error";
            expression = "";
          }
          return;
        }

        if (value === ".") {
          const parts = expression.split(/[+\-*/]/);
          if (parts[parts.length - 1].includes(".")) return;
        }

        if ("+-*/".includes(value)) {
          if (!expression) {
            if (value === "-") {
              expression = "-";
              display.value = expression;
            }
            return;
          }
          if ("+-*/".includes(expression[expression.length - 1])) {
            expression = expression.slice(0, -1);
          }
        }

        expression += value;
        display.value = expression;
      });
    });
  }

  // ---------- Notes ----------

  function notesHTML() {
    return (
      '<textarea id="ce-tool-notes" class="ce-textarea" placeholder="Write your note here..."></textarea>' +
      '<div class="ce-btn-row">' +
      '<button id="ce-save-note" class="ce-btn">💾 Save</button>' +
      '<button id="ce-clear-note" class="ce-btn ce-btn-soft">🗑️ Clear</button>' +
      "</div>" +
      '<p id="ce-note-status" class="ce-note-status"></p>'
    );
  }

  function notesInit() {
    const notes = $("#ce-tool-notes");
    const status = $("#ce-note-status");
    notes.value = store.get("tool-note", "");

    $("#ce-save-note").addEventListener("click", () => {
      store.set("tool-note", notes.value);
      status.textContent = "✓ Note saved successfully.";
    });

    $("#ce-clear-note").addEventListener("click", () => {
      notes.value = "";
      store.remove("tool-note");
      status.textContent = "Note cleared.";
    });
  }

  // ---------- Text counter ----------

  function counterHTML() {
    return (
      '<textarea id="ce-counter-input" class="ce-textarea" placeholder="Type or paste your text here..."></textarea>' +
      '<div class="ce-counter-results">' +
      '<div><strong id="ce-word-count">0</strong><span>Words</span></div>' +
      '<div><strong id="ce-char-count">0</strong><span>Characters</span></div>' +
      '<div><strong id="ce-line-count">0</strong><span>Lines</span></div>' +
      "</div>"
    );
  }

  function counterInit() {
    const textInput = $("#ce-counter-input");

    textInput.addEventListener("input", () => {
      const text = textInput.value;
      $("#ce-word-count").textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
      $("#ce-char-count").textContent = text.length;
      $("#ce-line-count").textContent = text ? text.split(/\n/).length : 0;
    });
  }

  // ---------- Stopwatch ----------

  function stopwatchHTML() {
    return (
      '<div class="ce-clock" id="ce-clock">00:00.00</div>' +
      '<div class="ce-btn-row">' +
      '<button class="ce-btn" id="ce-sw-start">▶ Start</button>' +
      '<button class="ce-btn ce-btn-soft" id="ce-sw-lap">🏁 Lap</button>' +
      '<button class="ce-btn ce-btn-soft" id="ce-sw-reset">↺ Reset</button>' +
      "</div>" +
      '<ol class="ce-laps" id="ce-laps"></ol>'
    );
  }

  function stopwatchInit() {
    const clock = $("#ce-clock");
    const startBtn = $("#ce-sw-start");
    const laps = $("#ce-laps");

    let elapsed = 0;
    let startedAt = 0;
    let timer = null;

    function format(ms) {
      const total = Math.floor(ms / 10);
      const cs = String(total % 100).padStart(2, "0");
      const s = String(Math.floor(total / 100) % 60).padStart(2, "0");
      const m = String(Math.floor(total / 6000)).padStart(2, "0");
      return m + ":" + s + "." + cs;
    }

    function tick() {
      clock.textContent = format(elapsed + Date.now() - startedAt);
    }

    startBtn.addEventListener("click", () => {
      if (timer) {
        elapsed += Date.now() - startedAt;
        clearInterval(timer);
        timer = null;
        startBtn.textContent = "▶ Resume";
      } else {
        startedAt = Date.now();
        timer = setInterval(tick, 40);
        startBtn.textContent = "⏸ Pause";
      }
    });

    $("#ce-sw-lap").addEventListener("click", () => {
      if (!timer) return;
      const li = document.createElement("li");
      li.textContent = clock.textContent;
      laps.prepend(li);
    });

    $("#ce-sw-reset").addEventListener("click", () => {
      clearInterval(timer);
      timer = null;
      elapsed = 0;
      clock.textContent = "00:00.00";
      startBtn.textContent = "▶ Start";
      laps.innerHTML = "";
    });

    return () => clearInterval(timer);
  }

  // ---------- To-do ----------

  function todoHTML() {
    return (
      '<div class="ce-todo-add">' +
      '<input id="ce-todo-input" class="ce-todo-input" type="text" placeholder="Add a task..." autocomplete="off">' +
      '<button id="ce-todo-add" class="ce-btn">Add</button>' +
      "</div>" +
      '<ul class="ce-todo-list" id="ce-todo-list"></ul>' +
      '<p class="ce-note-status" id="ce-todo-count"></p>'
    );
  }

  function todoInit() {
    const list = $("#ce-todo-list");
    const field = $("#ce-todo-input");
    const count = $("#ce-todo-count");

    let todos = [];
    try {
      todos = JSON.parse(store.get("todos", "[]")) || [];
    } catch {
      todos = [];
    }

    function save() {
      store.set("todos", JSON.stringify(todos));
    }

    function render() {
      list.innerHTML = "";

      todos.forEach((todo, index) => {
        const li = document.createElement("li");
        if (todo.done) li.className = "done";

        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = todo.done;
        check.addEventListener("change", () => {
          todo.done = check.checked;
          save();
          render();
        });

        const label = document.createElement("span");
        label.textContent = todo.text;

        const del = document.createElement("button");
        del.textContent = "×";
        del.setAttribute("aria-label", "Delete");
        del.addEventListener("click", () => {
          todos.splice(index, 1);
          save();
          render();
        });

        li.appendChild(check);
        li.appendChild(label);
        li.appendChild(del);
        list.appendChild(li);
      });

      const left = todos.filter((t) => !t.done).length;
      count.textContent = todos.length
        ? left + " task" + (left === 1 ? "" : "s") + " left"
        : "Nothing here yet ✨";
    }

    function add() {
      const text = field.value.trim();
      if (!text) return;
      todos.push({ text: text, done: false });
      field.value = "";
      save();
      render();
    }

    $("#ce-todo-add").addEventListener("click", add);
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter") add();
    });

    render();
  }

  // ---------- Dice & coin ----------

  function diceHTML() {
    return (
      '<div class="ce-dice-result" id="ce-dice-result">🎲</div>' +
      '<div class="ce-dice-label" id="ce-dice-label">Pick one!</div>' +
      '<div class="ce-btn-row">' +
      '<button class="ce-btn" data-roll="dice">🎲 Dice</button>' +
      '<button class="ce-btn" data-roll="coin">🪙 Coin</button>' +
      '<button class="ce-btn" data-roll="num">🔢 1–100</button>' +
      "</div>"
    );
  }

  function diceInit() {
    const result = $("#ce-dice-result");
    const label = $("#ce-dice-label");
    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

    $$("[data-roll]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kind = btn.dataset.roll;

        if (kind === "dice") {
          const n = Math.floor(Math.random() * 6);
          result.textContent = faces[n];
          label.textContent = "You rolled a " + (n + 1);
        } else if (kind === "coin") {
          const heads = Math.random() < 0.5;
          result.textContent = heads ? "👑" : "🌙";
          label.textContent = heads ? "Heads!" : "Tails!";
        } else {
          const n = Math.floor(Math.random() * 100) + 1;
          result.textContent = n;
          label.textContent = "Random number";
        }

        result.classList.remove("ce-pop");
        void result.offsetWidth;
        result.classList.add("ce-pop");
      });
    });
  }

  const TOOLS = [
    {
      icon: "🧮", title: "Calculator", desc: "Perform quick calculations.",
      color: "#eee7ff", html: calculatorHTML(), init: calculatorInit
    },
    {
      icon: "📝", title: "Quick Notes", desc: "Write and save your notes.",
      color: "#ffe8f1", html: notesHTML(), init: notesInit
    },
    {
      icon: "🔤", title: "Text Counter", desc: "Count words and characters.",
      color: "#e8f3ff", html: counterHTML(), init: counterInit
    },
    {
      icon: "⏱️", title: "Stopwatch", desc: "Time things with laps.",
      color: "#e1f7ee", html: stopwatchHTML(), init: stopwatchInit
    },
    {
      icon: "✅", title: "To-Do List", desc: "Keep track of your tasks.",
      color: "#fff3d6", html: todoHTML(), init: todoInit
    },
    {
      icon: "🎲", title: "Dice & Coin", desc: "Roll, flip or pick a number.",
      color: "#ffe7e1", html: diceHTML(), init: diceInit
    }
  ];

  const toolItems = $("#ce-tool-items");

  TOOLS.forEach((tool) => {
    const item = document.createElement("div");
    item.className = "ce-tool-item";

    item.innerHTML =
      '<div class="ce-tool-item-icon"></div>' +
      '<div class="ce-tool-item-info"><strong></strong><p></p></div>' +
      '<span class="ce-tool-arrow">›</span>';

    const icon = item.querySelector(".ce-tool-item-icon");
    icon.textContent = tool.icon;
    icon.style.background = tool.color;
    item.querySelector("strong").textContent = tool.title;
    item.querySelector("p").textContent = tool.desc;

    item.addEventListener("click", () => openTool(tool));
    toolItems.appendChild(item);
  });

  // =====================================================
  // STYLE TAB ACTIONS
  // =====================================================

  $("#ce-confetti").addEventListener("click", confetti);

  $("#ce-clear-chat").addEventListener("click", () => {
    messages.innerHTML = "";
    toast("Chat cleared 🧹");
  });

  // =====================================================
  // DRAGGING
  // =====================================================

  const header = $(".ce-header");

  header.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;

    const rect = container.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;

    header.setPointerCapture(e.pointerId);
    header.classList.add("dragging");

    function move(ev) {
      const left = Math.min(Math.max(0, ev.clientX - dx), window.innerWidth - rect.width);
      const top = Math.min(Math.max(0, ev.clientY - dy), window.innerHeight - rect.height);
      container.style.left = left + "px";
      container.style.top = top + "px";
      container.style.right = "auto";
      container.style.bottom = "auto";
    }

    function up() {
      header.classList.remove("dragging");
      header.removeEventListener("pointermove", move);
      header.removeEventListener("pointerup", up);
    }

    header.addEventListener("pointermove", move);
    header.addEventListener("pointerup", up);
  });

  // =====================================================
  // MINIMIZE / OPEN
  // =====================================================

  $("#ce-close").addEventListener("click", () => {
    container.classList.add("ce-closing");
    setTimeout(() => {
      container.classList.remove("ce-closing");
      container.classList.add("ce-hidden");
      launcher.classList.remove("ce-hidden");
    }, 200);
  });

  launcher.addEventListener("click", () => {
    launcher.classList.add("ce-hidden");
    container.classList.remove("ce-hidden");
    container.classList.add("ce-opening");
    setTimeout(() => container.classList.remove("ce-opening"), 300);
    scrollDown();
  });
})();