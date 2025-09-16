import Swal from 'sweetalert2';

// Um "Mixin" para criar um estilo base para os alertas, combinando com o tema escuro.
const DarkThemeSwal = Swal.mixin({
  background: '#1e293b', // bg-slate-800
  color: '#e2e8f0',      // text-slate-200
  confirmButtonColor: '#dc2626', // bg-red-600
  cancelButtonColor: '#475569', // bg-slate-600
  cancelButtonText: 'Cancelar',
});

/**
 * Mostra o pop-up de confirmação de exclusão para um ativo específico.
 * Retorna uma promessa que resolve para `true` se confirmado, `false` se cancelado.
 */
export const confirmAssetDelete = async (assetName: string): Promise<boolean> => {
  const expectedText = `excluir ativo ${assetName.toLowerCase()}`;

  const result = await DarkThemeSwal.fire({
    title: 'Confirmar Exclusão',
    html: `
      <p style="color: #94a3b8;">Esta ação é irreversível. Todos os dados associados a este ativo serão perdidos.</p>
      <p style="color: #94a3b8;" class="mt-4">Para confirmar, digite o texto abaixo:</p>
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
    confirmButtonText: '<span style="color: #fff; font-weight: bold;">Excluir Permanentemente</span>',
    showLoaderOnConfirm: true,
    preConfirm: (value) => {
      if (value.toLowerCase() !== expectedText) {
        Swal.showValidationMessage('O texto digitado não corresponde ao esperado.');
        return false;
      }
      return true;
    },
    allowOutsideClick: () => !Swal.isLoading()
  });

  return result.isConfirmed;
};
