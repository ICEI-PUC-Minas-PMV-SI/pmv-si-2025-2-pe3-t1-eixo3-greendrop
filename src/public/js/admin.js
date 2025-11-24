(function ($) {
    'use strict';

    let residuosCache = [];
    let usuarioSelecionado = null;

    function carregarEstatisticas() {
        $.ajax({
            url: '/api/admin/estatisticas',
            method: 'GET',
            success: function (data) {
                if (data.error) {
                    console.error('Erro ao carregar estatísticas:', data.error);
                    return;
                }

                $('.metrica-validados').text(data.descartesValidados || 0);
                $('.metrica-pendentes').text(data.descartesPendentes || 0);
                $('.metrica-pontos').text(data.pontosAtribuidos || 0);
            },
            error: function (error) {
                console.error('Erro ao buscar estatísticas:', error);
            }
        });
    }

    function carregarResiduos() {
        $.ajax({
            url: '/api/residuos',
            method: 'GET',
            success: function (data) {
                residuosCache = data;

                const $selectMaterial = $('#material-select');
                if (!$selectMaterial.length) return;

                $selectMaterial.html('<option value="">Selecione o material...</option>');

                $.each(residuosCache, function (index, residuo) {
                    const option = $('<option>', {
                        value: residuo.id,
                        text: `${residuo.nome} (${residuo.pontosPorKg} pts/kg)`,
                        'data-pontos-por-kg': residuo.pontosPorKg
                    });
                    $selectMaterial.append(option);
                });
            },
            error: function (error) {
                console.error('Erro ao carregar resíduos:', error);
            }
        });
    }

    function buscarUsuarios(termo) {
        if (!termo || termo.length < 2) {
            $('#usuarios-lista').addClass('hidden');
            return;
        }

        $.ajax({
            url: '/api/usuarios',
            method: 'GET',
            data: { busca: termo },
            success: function (usuarios) {
                const $lista = $('#usuarios-lista');
                $lista.empty();

                if (usuarios.length === 0) {
                    $lista.html('<div class="px-4 py-2 text-gray-500 text-sm">Nenhum usuário encontrado</div>');
                } else {
                    $.each(usuarios, function (index, user) {
                        const $item = $('<div>', {
                            class: 'px-4 py-2 hover:bg-gray-100 cursor-pointer transition',
                            html: `
                                <div class="font-medium text-gray-800">${user.name}</div>
                                <div class="text-xs text-gray-500">${user.email} - ${user.pontos || 0} pontos</div>
                            `
                        }).on('click', function () {
                            selecionarUsuario(user);
                        });
                        $lista.append($item);
                    });
                }

                $lista.removeClass('hidden');
            },
            error: function (error) {
                console.error('Erro ao buscar usuários:', error);
            }
        });
    }

    function selecionarUsuario(user) {
        usuarioSelecionado = user;

        // Preencher campos da interface
        $('#usuario-busca').val(`${user.name} (${user.email})`);
        $('#usuarios-lista').addClass('hidden');
        $('#usuario-selecionado').removeClass('hidden');
        $('#usuario-nome-display').text(user.name);
        $('#usuario-email-display').text(user.email);
        $('#usuario-pontos-display').text(`${user.pontos || 0} pontos`);

        calcularPontos();
    }

    function limparUsuario() {
        usuarioSelecionado = null;
        $('#usuario-busca').val('');
        $('#usuario-selecionado').addClass('hidden');
        $('#pontos-previsao').addClass('hidden');
    }

    function calcularPontos() {
        const $materialSelect = $('#material-select');
        const quantidade = parseFloat($('#quantidade-input').val());
        const $previsaoDiv = $('#pontos-previsao');

        if (!$materialSelect.val() || !quantidade || !usuarioSelecionado) {
            $previsaoDiv.addClass('hidden');
            return;
        }

        const pontosPorKg = parseFloat($materialSelect.find(':selected').data('pontos-por-kg'));
        const pontosCalculados = Math.round(quantidade * pontosPorKg);

        $('#pontos-calculados').text(pontosCalculados);
        $('#pontos-novos').text((usuarioSelecionado.pontos || 0) + pontosCalculados);
        $previsaoDiv.removeClass('hidden');
    }

    function registrarDescarte(event) {
        event.preventDefault();

        if (!usuarioSelecionado) {
            alert('Selecione um usuário');
            return;
        }

        const materialId = $('#material-select').val();
        const quantidade = parseFloat($('#quantidade-input').val());
        const unidade = $('#unidade-select').val();

        if (!materialId || !quantidade) {
            alert('Preencha todos os campos');
            return;
        }

        const $btnSubmit = $('#btn-registrar-descarte');
        $btnSubmit.prop('disabled', true).text('Registrando...');

        $.ajax({
            url: '/api/admin/descartes',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: usuarioSelecionado.id,
                residuoId: materialId,
                quantidade: quantidade,
                unidade: unidade
            }),
            success: function (data) {
                if (data.success) {
                    $('#modal-sucesso-usuario').text(usuarioSelecionado.name);
                    $('#modal-sucesso-pontos').text(data.descarte.pontosAtribuidos);
                    $('#modal-descarte-sucesso').removeClass('hidden');

                    limparFormulario();

                    carregarEstatisticas();

                    $('#btn-fechar-modal-sucesso').one('click', function () {
                        window.location.reload();
                    });
                } else {
                    alert(data.error || 'Erro ao registrar descarte');
                }
            },
            error: function (error) {
                console.error('Erro ao registrar descarte:', error);
                alert('Erro ao registrar descarte. Tente novamente.');
            },
            complete: function () {
                $btnSubmit.prop('disabled', false).text('Registrar Descarte');
            }
        });
    }

    function limparFormulario() {
        limparUsuario();
        $('#material-select').val('');
        $('#quantidade-input').val('');
        $('#unidade-select').val('kg');
        $('#pontos-previsao').addClass('hidden');
    }

    $(document).ready(function () {
        carregarEstatisticas();
        carregarResiduos();

        $('#usuario-busca').on('input', function () {
            buscarUsuarios($(this).val());
        });

        $(document).on('click', function (e) {
            if (!$(e.target).closest('#usuario-busca').length) {
                $('#usuarios-lista').addClass('hidden');
            }
        });

        $('#btn-limpar-usuario').on('click', limparUsuario);

        $('#material-select').on('change', calcularPontos);
        $('#quantidade-input').on('input', calcularPontos);

        $('#form-registrar-descarte').on('submit', registrarDescarte);

        $('#btn-fechar-modal-sucesso').on('click', function () {
            $('#modal-descarte-sucesso').addClass('hidden');
        });

        $('#modal-descarte-sucesso').on('click', function (e) {
            if (e.target === this) {
                $(this).addClass('hidden');
            }
        });
    });

})(jQuery);
