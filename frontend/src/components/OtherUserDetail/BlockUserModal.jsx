import React, { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const BlockUserModal = ({ open, onClose, onConfirm, username, isCurrentlyBanned }) => {
  const [deletePeriod, setDeletePeriod] = useState("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deletionOptions = [
    { value: "none", label: "Не удалять сообщения" },
    { value: "hour", label: "Последний час" },
    { value: "day", label: "Последние сутки" },
    { value: "week", label: "Последняя неделя" },
    { value: "month", label: "Последний месяц" },
    { value: "all", label: "За все время" },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(deletePeriod);
      onClose();
    } catch (error) {
      console.error("Ошибка при блокировке:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <DialogContent className="max-w-md" onOverlayClick={onClose}>
        <DialogHeader>
          <DialogTitle>
            {isCurrentlyBanned ? "Разблокировать пользователя" : "Заблокировать пользователя"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isCurrentlyBanned
              ? `Вы уверены, что хотите разблокировать пользователя ${username}?`
              : `Вы уверены, что хотите заблокировать пользователя ${username}?`}
          </p>

          {!isCurrentlyBanned && (
            <Card>
              <CardContent className="p-4 space-y-3 mt-4">
                <p className="text-sm font-medium">Удалить сообщения пользователя:</p>
                <div className="space-y-2">
                  {deletionOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <input
                        type="radio"
                        name="deletePeriod"
                        value={option.value}
                        checked={deletePeriod === option.value}
                        onChange={(e) => setDeletePeriod(e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button
              variant={isCurrentlyBanned ? "default" : "destructive"}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Обработка..."
                : isCurrentlyBanned
                ? "Разблокировать"
                : "Заблокировать"}
            </Button>
          </div>
        </div>
      </DialogContent>
  );
};

export default BlockUserModal;
