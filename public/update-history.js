(() => {
  if (typeof state === "undefined" || typeof el !== "function") return;

  if (typeof zhText !== "undefined") {
    Object.assign(zhText, {
      "Update history": "历史更新",
      "Password changes and admin feedback are available from Profile.": "个人资料中已加入修改密码和给管理员留言功能。",
      "Account popups now keep typed text while the table refreshes.": "修改密码和留言窗口在牌桌刷新时会保留正在输入的内容。",
      "Score Battle hosts can now add CPU players.": "积分对战房主现在可以添加 CPU 玩家。"
    });
  }

  state.showUpdateHistory = Boolean(state.showUpdateHistory);

  const styleId = "update-history-modal-style";
  if (!document.querySelector(`#${styleId}`)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .update-history-modal { max-height: min(82vh, 44rem); overflow: auto; }
      .update-history-section { border-top: 1px solid var(--line); padding-top: 0.85rem; margin-top: 0.85rem; }
      .update-history-section h3 { margin: 0 0 0.45rem; }
    `;
    document.head.appendChild(style);
  }

  function updateHistoryEntries() {
    return [
      {
        version: "0.0.6",
        items: [
          "Password changes and admin feedback are available from Profile.",
          "Account popups now keep typed text while the table refreshes.",
          "Score Battle hosts can now add CPU players.",
          "Traditional card-table mode has been removed; the app now focuses on Score Battle.",
          "New critical, discard, and comeback effects are available in Score Battle.",
          "This build is prepared for GitHub backup and future internet deployment."
        ]
      },
      {
        version: "0.0.5",
        items: [
          "Score Battle now previews your selected five-card score before submission.",
          "Score Battle results are now saved into profile history with full standings.",
          "Tomato throws are now available at tables, with shared flight and splat animations.",
          "Score Battle effects received balance adjustments.",
          "Table polling is faster, so clicks and shared effects should feel more responsive."
        ]
      },
      {
        version: "0.0.4",
        items: [
          "Version 0.0.4 keeps the five-round effect mode and records each player's total score.",
          "Scoring rules can be opened from the table side panel.",
          "Score Battle choices now have two-minute timers and clearer scoring animations."
        ]
      },
      {
        version: "0.0.3",
        items: [
          "Score Battle now shows every player's played cards, with community cards highlighted.",
          "Score plays must include at least one community card, and hand sizes are now 3 / 4 / 5."
        ]
      },
      {
        version: "0.0.2",
        items: [
          "Last hand winners now have gold stars.",
          "Seat result markers show Victory plus won points, or red lost points, after settlement.",
          "Eliminated players can use Try again to restore 100 points for the next hand.",
          "Avatar uploads are compressed locally before being saved."
        ]
      },
      {
        version: "0.0.1",
        items: [
          "Tables that stay unstarted for 5 minutes now close automatically.",
          "History now records only hands where you joined betting and reached settlement.",
          "The update notice appears once for each account after a new version is released."
        ]
      }
    ];
  }

  function openUpdateHistory() {
    state.showUpdateHistory = true;
    render();
  }

  function closeUpdateHistory() {
    state.showUpdateHistory = false;
    render();
  }

  function appendUpdateHistoryModal() {
    if (!state.showUpdateHistory) return;
    app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [
      el("section", { className: "update-modal update-history-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "update-history-title" }, [
        el("div", { className: "modal-head" }, [
          el("div", {}, [
            el("span", { className: "pill" }, [t("Version")]),
            el("h2", { id: "update-history-title" }, [t("Update history")])
          ]),
          el("button", { className: "ghost modal-close", type: "button", onclick: closeUpdateHistory, "aria-label": t("Close") }, ["x"])
        ]),
        ...updateHistoryEntries().map((entry) => el("section", { className: "update-history-section" }, [
          el("h3", {}, [t(`Update ${entry.version}`)]),
          el("ul", { className: "update-list" }, entry.items.map((item) => el("li", {}, [t(item)])))
        ])),
        el("button", { type: "button", onclick: closeUpdateHistory }, [t("Close")])
      ])
    ]));
  }

  const originalRenderTopbar = renderTopbar;
  renderTopbar = function renderTopbarWithUpdateHistory(withUser) {
    const bar = originalRenderTopbar(withUser);
    const strip = bar.querySelector(".user-strip");
    if (!strip || strip.querySelector("[data-update-history-button]")) return bar;
    const button = el("button", {
      className: "ghost",
      type: "button",
      "data-update-history-button": "true",
      onclick: openUpdateHistory
    }, [t("Update history")]);
    const logoutButton = Array.from(strip.querySelectorAll("button")).find((node) => node.textContent === t("Logout"));
    strip.insertBefore(button, logoutButton || null);
    return bar;
  };

  const originalRender = render;
  render = function renderWithUpdateHistory() {
    originalRender();
    appendUpdateHistoryModal();
  };

  const originalLogout = logout;
  logout = async function logoutWithUpdateHistoryReset() {
    state.showUpdateHistory = false;
    return originalLogout();
  };

  render();
})();
