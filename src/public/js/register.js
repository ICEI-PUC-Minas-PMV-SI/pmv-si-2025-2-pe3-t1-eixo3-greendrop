$(document).ready(function () {
    feather.replace();
    $('#userType').on('change', function () {
        if ($(this).val() === 'admin') {
            $('#admin-fields').removeClass('hidden');
        } else {
            $('#admin-fields').addClass('hidden');
        }
    });

    if ($('#userType').val() === 'admin') {
        $('#admin-fields').removeClass('hidden');
    }

    $('#cep').on('blur', function () {
        const cep = $(this).val().replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (!data.erro) {
                        $('#endereco').val(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
                    }
                });
        }
    });
});

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const iconContainer = passwordInput.nextElementSibling;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        iconContainer.innerHTML = '<i data-feather="eye-off" class="text-gray-400"></i>';
    } else {
        passwordInput.type = 'password';
        iconContainer.innerHTML = '<i data-feather="eye" class="text-gray-400"></i>';
    }
    feather.replace();
}