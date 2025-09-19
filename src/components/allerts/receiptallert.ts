// src/lib/alerts/contactalerts.ts

import Swal from 'sweetalert2';

/**
 * Exibe um modal de confirmação para excluir um grupo de contatos,
 * exigindo que o usuário digite "excluir contato".
 * @param groupName O nome do grupo de contatos.
 * @returns Uma promessa que resolve com o resultado do SweetAlert.
 */
export const confirmContactDelete = (groupName: string) => {
  const confirmationText = 'excluir contato';

  return Swal.fire({
    title: 'Confirmar Exclusão',
    html: `
      Você está prestes a excluir permanentemente o grupo <strong>${groupName}</strong>.
      <br><br>
      Para confirmar, digite <strong>${confirmationText}</strong> abaixo:
    `,
    icon: 'warning',
    input: 'text',
    inputPlaceholder: `Digite "${confirmationText}"`,
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    background: '#1e293b', // bg-slate-800
    color: '#f8fafc',      // text-slate-50
    inputValidator: (value) => {
      if (value !== confirmationText) {
        return `A frase digitada está incorreta.`;
      }
    },
  });
};