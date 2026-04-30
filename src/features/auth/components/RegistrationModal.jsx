import { useEffect, useState } from "react";
import Modal from "../../../shared/components/Modal.jsx";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "ENGINEER", label: "Engineer" },
];

const DOMAIN_OPTIONS = [
  "Analog Layout",
  "Verification",
  "Physical Design",
  "Other",
];
const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Expert"];

const DEFAULT_FORM = {
  fullName: "",
  email: "",
  role: "MANAGER",
  workDomain: "Analog Layout",
  experienceLevel: "Beginner",
  dailyCapacity: 8,
};

export default function RegistrationModal({
  isOpen,
  googleUser,
  initialRole,
  onClose,
  onSubmit,
  busy,
}) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (!isOpen) return;
    setForm((current) => ({
      ...current,
      fullName: googleUser?.name || current.fullName,
      email: googleUser?.email || current.email,
    }));
  }, [googleUser, isOpen]);

  useEffect(() => {
    if (!isOpen || !initialRole) return;
    setForm((current) => ({ ...current, role: initialRole }));
  }, [initialRole, isOpen]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      email: googleUser?.email || form.email,
      fullName: form.fullName.trim(),
      dailyCapacity: Number(form.dailyCapacity),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? undefined : onClose}
      title="Complete your profile"
      maxWidth={560}
      className="auth-modal"
      footer={
        <>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            type="button"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            type="submit"
            form="registration-form"
            disabled={busy}
          >
            {busy ? "Saving…" : "Finish registration"}
          </button>
        </>
      }
    >
      <form
        id="registration-form"
        className="registration-form"
        onSubmit={handleSubmit}
      >
        <div className="form-row">
          <label>Full Name</label>
          <input
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-row">
          <label>Email</label>
          <input
            value={googleUser?.email || form.email}
            placeholder="Google account email"
            readOnly={!!googleUser?.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
          />
          {googleUser?.email && (
            <div className="form-hint">Pulled from Google sign-in.</div>
          )}
        </div>

        <div className="form-grid">
          <div className="form-row">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Work Domain</label>
            <select
              value={form.workDomain}
              onChange={(event) =>
                updateField("workDomain", event.target.value)
              }
            >
              {DOMAIN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Experience Level</label>
            <select
              value={form.experienceLevel}
              onChange={(event) =>
                updateField("experienceLevel", event.target.value)
              }
            >
              {EXPERIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Daily Capacity (hours/day)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={form.dailyCapacity}
              onChange={(event) =>
                updateField("dailyCapacity", event.target.value)
              }
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
