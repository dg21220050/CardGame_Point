(() => {
  if (typeof state === "undefined" || typeof el !== "function") return;

  state.passwordDraft = state.passwordDraft || { oldPassword: "", newPassword: "", confirmPassword: "" };
  state.feedbackDraft = state.feedbackDraft || "";

  snapshotFocus = function snapshotFocusPatched() {
    const active = document.activeElement;
    if (!active || !["INPUT", "TEXTAREA"].includes(active.tagName)) return null;
    const field = active.getAttribute("data-field");
    if (!field) return null;
    let start = null;
    let end = null;
    try {
      start = active.selectionStart;
      end = active.selectionEnd;
    } catch {
      // Number inputs do not always expose text selection.
    }
    return { field, start, end };
  };

  closePasswordModal = function closePasswordModalPatched() {
    state.showPasswordModal = false;
    state.passwordDraft = { oldPassword: "", newPassword: "", confirmPassword: "" };
    render();
  };

  closeFeedbackModal = function closeFeedbackModalPatched() {
    state.showFeedbackModal = false;
    state.feedbackDraft = "";
    render();
  };

  appendPasswordModal = function appendPasswordModalPatched() {
    if (!state.user || !state.showPasswordModal) return;
    const draft = state.passwordDraft || { oldPassword: "", newPassword: "", confirmPassword: "" };
    const oldPasswordInput = el("input", {
      type: "password",
      value: draft.oldPassword,
      "data-field": "account-old-password",
      autocomplete: "current-password",
      required: true,
      oninput: () => {
        state.passwordDraft.oldPassword = oldPasswordInput.value;
      }
    });
    const newPasswordInput = el("input", {
      type: "password",
      value: draft.newPassword,
      "data-field": "account-new-password",
      autocomplete: "new-password",
      required: true,
      minlength: "4",
      maxlength: "72",
      oninput: () => {
        state.passwordDraft.newPassword = newPasswordInput.value;
      }
    });
    const confirmPasswordInput = el("input", {
      type: "password",
      value: draft.confirmPassword,
      "data-field": "account-confirm-password",
      autocomplete: "new-password",
      required: true,
      minlength: "4",
      maxlength: "72",
      oninput: () => {
        state.passwordDraft.confirmPassword = confirmPasswordInput.value;
      }
    });
    const submitButton = el("button", { type: "submit" }, [t("Update password")]);
    const form = el("form", {
      className: "form-grid",
      onsubmit: async (event) => {
        event.preventDefault();
        const oldPassword = oldPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (newPassword !== confirmPassword) {
          alert(t("New passwords do not match."));
          return;
        }
        if (newPassword.length < 4 || newPassword.length > 72) {
          alert(t("New password must be 4-72 characters."));
          return;
        }
        submitButton.disabled = true;
        try {
          await api("/api/profile/password", {
            method: "POST",
            body: { oldPassword, newPassword, confirmPassword }
          });
          alert(t("Password updated."));
          closePasswordModal();
        } catch (error) {
          alert(displayError(error.message));
        } finally {
          submitButton.disabled = false;
        }
      }
    }, [
      el("label", {}, [el("span", {}, [t("Current password")]), oldPasswordInput]),
      el("label", {}, [el("span", {}, [t("New password")]), newPasswordInput]),
      el("label", {}, [el("span", {}, [t("Confirm new password")]), confirmPasswordInput]),
      submitButton
    ]);

    app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [
      el("section", { className: "update-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "password-title" }, [
        el("div", { className: "modal-head" }, [
          el("div", {}, [
            el("span", { className: "pill" }, [t("Profile")]),
            el("h2", { id: "password-title" }, [t("Change password")])
          ]),
          el("button", { className: "ghost modal-close", type: "button", onclick: closePasswordModal, "aria-label": t("Close") }, ["x"])
        ]),
        form
      ])
    ]));
  };

  appendFeedbackModal = function appendFeedbackModalPatched() {
    if (!state.user || !state.showFeedbackModal) return;
    const feedbackText = state.feedbackDraft || "";
    const counter = el("span", { className: "meta" }, [`${feedbackText.length} / 200`]);
    const messageInput = el("textarea", {
      rows: "5",
      maxlength: "200",
      required: true,
      value: feedbackText,
      "data-field": "account-feedback-message",
      placeholder: t("Do not include personal information."),
      oninput: () => {
        state.feedbackDraft = messageInput.value;
        counter.textContent = `${messageInput.value.length} / 200`;
      }
    });
    const submitButton = el("button", { type: "submit" }, [t("Submit feedback")]);
    const form = el("form", {
      className: "form-grid",
      onsubmit: async (event) => {
        event.preventDefault();
        const message = messageInput.value.trim();
        if (!message) {
          alert(t("Write a message before submitting feedback."));
          return;
        }
        if (message.length > 200) {
          alert(t("Feedback must be 200 characters or fewer."));
          return;
        }
        submitButton.disabled = true;
        try {
          await api("/api/feedback", {
            method: "POST",
            body: { message }
          });
          alert(t("Feedback sent. Thank you."));
          closeFeedbackModal();
        } catch (error) {
          alert(displayError(error.message));
        } finally {
          submitButton.disabled = false;
        }
      }
    }, [
      el("p", { className: "meta" }, [t("Do not include personal information.")]),
      el("label", {}, [el("span", {}, [t("Feedback is limited to 200 characters.")]), messageInput]),
      counter,
      submitButton
    ]);

    app.appendChild(el("div", { className: "modal-backdrop", role: "presentation" }, [
      el("section", { className: "update-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "feedback-title" }, [
        el("div", { className: "modal-head" }, [
          el("div", {}, [
            el("span", { className: "pill" }, [t("Profile")]),
            el("h2", { id: "feedback-title" }, [t("Feedback to admin")])
          ]),
          el("button", { className: "ghost modal-close", type: "button", onclick: closeFeedbackModal, "aria-label": t("Close") }, ["x"])
        ]),
        form
      ])
    ]));
  };

  const originalLogout = logout;
  logout = async function logoutPatched() {
    state.passwordDraft = { oldPassword: "", newPassword: "", confirmPassword: "" };
    state.feedbackDraft = "";
    return originalLogout();
  };
})();
