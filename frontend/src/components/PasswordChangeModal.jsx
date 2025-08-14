// Create a new file: src/components/PasswordChangeModal.jsx
import React from "react";

const PasswordChangeModal = ({
  isOpen,
  onClose,
  passwordChangeStatus,
  onPasswordChange,
}) => {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordSuccess, setPasswordSuccess] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError("New password must be at least 12 characters long");
      return;
    }

    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const result = await onPasswordChange(currentPassword, newPassword);

      if (result.success) {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");

        setTimeout(() => {
          onClose();
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(result.message || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("An error occurred while changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleClose = () => {
    setPasswordError("");
    setPasswordSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Password Change Eligibility */}
          {passwordChangeStatus && !passwordChangeStatus.canChange && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
              <p className="text-sm">
                <strong>Password Change Restricted:</strong> You must wait{" "}
                {passwordChangeStatus.hoursRemaining} more hour(s) before
                changing your password again.
              </p>
              <p className="text-xs mt-1">
                Next change allowed:{" "}
                {new Date(
                  passwordChangeStatus.nextChangeAllowed
                ).toLocaleString()}
              </p>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!passwordChangeStatus?.canChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!passwordChangeStatus?.canChange}
                minLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 12 characters with uppercase, lowercase,
                number, and special character
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!passwordChangeStatus?.canChange}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={changingPassword}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPassword || !passwordChangeStatus?.canChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
