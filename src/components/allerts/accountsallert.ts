// /src/components/allerts/accountsallert.ts

import Swal from 'sweetalert2';

// Um "Mixin" para criar um estilo base para os alertas, combinando com o tema escuro.
const DarkThemeSwal = Swal.mixin({
  background: '#1e293b', // bg-slate-800
  color: '#e2e8f0',      // text-slate-200
  confirmButtonColor: '#facc15', // bg-yellow-400
  confirmButtonText: '<span style="color: #1e293b; font-weight: bold;">OK</span>',
  cancelButtonColor: '#475569', // bg-slate-600
  cancelButtonText: 'Cancelar',
});

// Alertas de feedback rápido (toasts) que aparecem no canto.
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#1e293b',
  color: '#e2e8f0',
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

/**
 * Mostra um alerta de sucesso rápido no canto da tela.
 */
export const showSuccess = (message: string) => {
  Toast.fire({
    icon: 'success',
    title: message
  });
};

/**
 * Mostra um alerta de erro rápido no canto da tela.
 */
export const showError = (message: string) => {
  Toast.fire({
    icon: 'error',
    title: message
  });
};

/**
 * Mostra um pop-up de confirmação genérico.
 * Retorna uma promessa que resolve para `true` se confirmado, `false` se cancelado.
 */
export const confirmAction = async ({
  title,
  text,
  confirmButtonText = 'Confirmar',
  icon = 'warning',
}: {
  title: string;
  text: string;
  confirmButtonText?: string;
  icon?: 'warning' | 'info' | 'question';
}): Promise<boolean> => {
  const result = await DarkThemeSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: `<span style="color: #1e293b; font-weight: bold;">${confirmButtonText}</span>`,
  });
  return result.isConfirmed;
};

/**
 * Mostra o pop-up de confirmação de exclusão com campo de texto.
 * Retorna uma promessa que resolve para `true` se confirmado, `false` se cancelado.
 */
export const confirmDelete = async (clientName: string): Promise<boolean> => {
  const expectedText = `excluir cliente ${clientName}`;

  const result = await DarkThemeSwal.fire({
    title: 'Confirmar Exclusão',
    html: `
      <p style="color: #94a3b8;">Esta ação é irreversível. Para confirmar, digite o texto abaixo:</p>
      <p class="mt-2 text-sm font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
        ${expectedText}
      </p>
    `,
    input: 'text',
    inputPlaceholder: 'Digite o texto de confirmação aqui',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: '<span style="color: #1e293b; font-weight: bold;">Excluir Permanentemente</span>',
    confirmButtonColor: '#dc2626', // bg-red-600
    preConfirm: (value) => {
      if (value.toLowerCase() !== expectedText.toLowerCase()) {
        Swal.showValidationMessage('O texto digitado não corresponde ao esperado.');
        return false;
      }
      return value;
    }
  });

  return result.isConfirmed;
};