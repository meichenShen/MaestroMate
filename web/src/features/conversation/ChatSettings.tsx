import { useRef } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { ChatConfig } from "../../content/knowledge/chat-contract";
export function ChatSettings({
  config,
  enabled,
  pending,
  model,
  onModel,
  onEnable,
}: {
  config: ChatConfig | null;
  enabled: boolean;
  pending: boolean;
  model: string;
  onModel: (v: string) => void;
  onEnable: (v: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    opener = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={opener}
        className="chat-settings-open"
        aria-label="Chat settings"
        onClick={() => dialog.current?.showModal()}
      >
        <SlidersHorizontal size={18} />
        <span>Settings</span>
      </button>
      <dialog
        ref={dialog}
        className="discovery-dialog chat-settings"
        aria-labelledby="chat-settings-title"
        data-lenis-prevent
        onClose={() => opener.current?.focus({ preventScroll: true })}
      >
        <header>
          <h2 id="chat-settings-title">How shall we talk?</h2>
          <button onClick={() => dialog.current?.close()}>Close</button>
        </header>
        <p>
          Start with our prepared questions, or invite AI into the conversation.
        </p>
        <div className="chat-setting-choice">
          <h3>Prepared conversation</h3>
          <p>
            Written and checked by MaestroMate. No questions are sent to an AI
            service.
          </p>
          <button
            disabled={pending || !enabled}
            onClick={() => {
              onEnable(false);
              dialog.current?.close();
            }}
          >
            Use prepared questions
          </button>
        </div>
        <div className="chat-setting-choice">
          <h3>AI conversation · Preview</h3>
          <p>
            An imagined Camille, guided by our knowledge shelf. Answers can
            still be mistaken. Open the sources to check what supports a reply.
          </p>
          <label htmlFor="chat-model">Model</label>
          <select
            id="chat-model"
            value={model}
            disabled={pending || !config?.enabled}
            onChange={(e) => onModel(e.target.value)}
          >
            {(config?.models.length
              ? config.models
              : [{ id: model, label: "Qwen Plus" }]
            ).map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="chat-data-note">
            When you enable AI, your question and up to three recent AI
            exchanges are sent to Alibaba Cloud Model Studio. MaestroMate keeps
            the conversation only in this page’s memory; the provider processes
            it under its own policies. Please leave out names, contact details
            and other private information. Children: ask a parent or teacher
            before using AI.
          </p>
          <a
            href="https://help.aliyun.com/zh/model-studio/data-security-and-privacy"
            target="_blank"
            rel="noreferrer"
          >
            Provider data and privacy information ↗
          </a>
          {!config ? (
            <p role="status">Checking availability…</p>
          ) : !config.enabled ? (
            <p className="chat-configuration-note">
              AI is not configured on this server. Prepared questions still
              work.
            </p>
          ) : null}
          <button
            className="enable-ai"
            disabled={pending || !config?.enabled}
            onClick={() => {
              onEnable(true);
              dialog.current?.close();
            }}
          >
            Enable AI conversation
          </button>
        </div>
        <p className="chat-data-note">
          This is a small pilot with shared daily limits. Prepared questions
          stay available when AI is busy.
        </p>
      </dialog>
    </>
  );
}
