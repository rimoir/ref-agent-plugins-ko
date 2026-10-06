# 모달 대화 상자

**과제:** "삭제 확인용 모달 대화 상자를 추가해 줘."

## Ponytail 없이

```bash
npm install @radix-ui/react-dialog
# or: npm install react-modal
```

```jsx
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

export function DeleteModal({ onConfirm, onCancel }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="btn-danger">Delete</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title>Confirm deletion</Dialog.Title>
          <Dialog.Description>This action cannot be undone.</Dialog.Description>
          <div className="dialog-actions">
            <Dialog.Close asChild>
              <button onClick={onCancel}>Cancel</button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button className="btn-danger" onClick={onConfirm}>Delete</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

버튼 두 개가 있는 상자 하나를 보여 주려고 의존성, 포털, 오버레이, 루트, 트리거, 콘텐츠 래퍼를 쓴다.

## Ponytail 적용

```html
<!-- ponytail: browser has one, with focus trapping and backdrop built in -->
<dialog id="confirm-delete">
  <p>This action cannot be undone.</p>
  <button id="cancel">Cancel</button>
  <button id="confirm">Delete</button>
</dialog>
```

```js
const dialog = document.getElementById("confirm-delete");
document.getElementById("cancel").onclick = () => dialog.close();
document.getElementById("confirm").onclick = () => { onConfirm(); dialog.close(); };

// Open it:
dialog.showModal();
```

**의존성 1개 + 30줄 → 의존성 0개 + 8줄.** 플랫폼 기본 `<dialog>`는 포커스를 대화 상자 안에 자동으로 가두고, Escape 키로 닫히고, `::backdrop`으로 배경을 그리며, 따로 손대지 않아도 접근성을 갖춘다. 2022년부터 모든 브라우저에서 쓸 수 있다. 이 라이브러리는 플랫폼이 이미 해결한 문제를 풀고 있었다.
