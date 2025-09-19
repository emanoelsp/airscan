// src/lib/alerts/thresholdsalerts.ts

import Swal from 'sweetalert2';

/**
 * Exibe um modal de confirmação do SweetAlert que exige que o usuário
 * digite uma frase específica para habilitar o botão de exclusão.
 * @param assetName O nome do ativo que será exibido no alerta.
 * @returns Uma promessa que resolve com o resultado do SweetAlert.
 */
export const confirmDeleteWithText = (assetName: string) => {
  const confirmationText = 'excluir limites';

  return Swal.fire({
    title: 'Você tem certeza?',
    html: `
      Esta ação não pode ser desfeita.
      <br>
      Os limites de pressão para <strong>${assetName}</strong> serão removidos.
      <br><br>
      Para confirmar, digite <strong>${confirmationText}</strong> no campo abaixo:
    `,
    icon: 'warning',
    input: 'text',
    inputPlaceholder: `Digite "${confirmationText}"`,
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir limites',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',

    // Estilos para combinar com o tema escuro do seu app
    background: '#1e293b', // bg-slate-800
    color: '#f8fafc',      // text-slate-50

    // Validador do campo de input
    inputValidator: (value) => {
      if (value !== confirmationText) {
        return `Você precisa digitar "${confirmationText}" para confirmar.`;
      }
    },
  });
};