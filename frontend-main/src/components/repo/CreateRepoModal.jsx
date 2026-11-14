import { useEffect, useState } from "react";
import api from "../../api";
import { useToast } from "../ui/Toast";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

export default function CreateRepoModal({ open, onClose, onCreated }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setIsPrivate(false);
    setError("");
    setSaving(false);
  }, [open]);

  async function submit(event) {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError("Give your repository a name first.");
      return;
    }

    const owner = localStorage.getItem("userId");
    if (!owner) {
      setError("Your session expired. Sign in again.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const { data } = await api.post("/repo/create", {
        owner,
        name: trimmed,
        description: description.trim(),
        visibility: !isPrivate,
        content: [],
      });
      toast({ title: "Repository created", description: trimmed, tone: "success" });
      onCreated?.(data);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Could not create the repository. Try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New repository"
      description="A name and a description. You can change both later."
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="create-repo-form" loading={saving}>
            Create repository
          </Button>
        </>
      }
    >
      <form id="create-repo-form" className="stack" onSubmit={submit}>
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="my-next-idea"
          required
        />

        <Input
          textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this project about?"
          rows={3}
        />

        <label className="switch-row">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(event) => setIsPrivate(event.target.checked)}
          />
          <span className="switch" aria-hidden="true" />
          <span className="switch-copy">
            <strong>Private repository</strong>
            <small>Only you can see it in the dashboard.</small>
          </span>
        </label>

        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
