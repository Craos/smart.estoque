let Operacoes = function () {

    let that = this, form, gridestoque, gridhist,
        operacao, itemestoque, cellpesquisa, cellformulario, cellhistorico;

    this.MontaLayout = function(container) {

        let layout = container.attachLayout({
            pattern: '3L',
            offsets: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            cells: [
                {
                    id: 'a',
                    header: false,
                    width: 300,
                    fix_size: [true, null]
                },
                {
                    id: 'b',
                    header: false,
                    height: 320,
                    fix_size: [true, null]

                },
                {
                    id: 'c',
                    header: false,
                }
            ]
        });

        cellpesquisa = layout.cells('a');
        cellformulario = layout.cells('b');
        cellhistorico = layout.cells('c');

        MontaGridPesquisa(cellpesquisa);
        MontaBarraComandos(cellformulario);
        MontaFormularioDados(cellformulario);
        MontaGridHistorico(cellhistorico);
    };

    function LimpaSelecoes() {
        gridestoque.clearAll();
        gridhist.clearAll();
        form.clear();
        form.setFormData({});
        form.setItemValue('id', null);
        form.setItemValue('quantidade', null);
        form.setItemValue('descricao', null);
        form.setItemValue('ultima_compra', null);
        form.setItemValue('modelo', null);
    }

    function MontaGridPesquisa(cell) {

        gridestoque = cell.attachGrid();
        gridestoque.setHeader(['Cd', 'Descrição']);
        gridestoque.attachHeader('#text_filter,#text_filter');
        gridestoque.setColTypes('ro,ro');
        gridestoque.setColSorting('int,str');
        gridestoque.setInitWidths("50");
        gridestoque.enableSmartRendering(true);
        gridestoque.enableMultiselect(true);
        gridestoque.init();

        gridestoque.attachEvent("onRowSelect", function (id) {

            itemestoque = id;
            cellformulario.progressOn();

            that.Info(id, function (estoqueinfo) {

                cellformulario.progressOff();

                if (estoqueinfo === null)
                    return;

                form.setFormData(estoqueinfo[0]);
                form.getContainer('foto').innerHTML = '<img class=operacao-foto src="./ws/foto/'+estoqueinfo[0].foto+'"/>';
                gridhist.clearAll();

                cellhistorico.progressOn();
                that.PesquisaHistorico(id, function (listahistorico) {

                    cellhistorico.progressOff();

                    if (!listahistorico)
                        return;

                    gridhist.parse(listahistorico,"json");
                });

            })
        });

    }

    function MontaBarraComandos(cell) {

        cell.detachToolbar();

        cell.attachToolbar({
            icon_path: "./img/toolbar/operacoes/",
            items:[
                {id: "entrada", text:"Entrada", type: "button", img: "entrada.png"},
                {id: "saida", text:"Saída", type: "button", img: "saida.png"},
            ],
            onClick: function (id) {
                operacao = id;
                form.validate();
            }
        });

    }

    function RegistraOperacao(dados, Callback) {

        webservice.Request({
            process: 'gmi.autorizacao',
            params: JSON.stringify(dados)
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                Callback(null);
                return;
            }

            Callback(JSON.parse(JSON.parse(http.response)[0].autorizacao)[0]);
        });

    }

    function MontaFormularioDados(cell) {

        form = cell.attachForm(formoperacoes);
        form.attachEvent("onAfterValidate", function (status){
            if (status === false)
                return;

            let dados = form.getFormData();

            if (operacao === 'saida' && dados.solicitante.length === 0) {
                form.setItemFocus('solicitante');
                dhtmlx.alert({
                    title:"GMI",
                    type:"alert-error",
                    text:"Informe o nome do solicitante"
                });
                return;
            }

            dados.responsavel = usuariocorrente.login;
            dados.operacao = operacao;

            cellformulario.progressOn();
            RegistraOperacao(dados, AoExecutarOperacao);

        });
    }

    function AoExecutarOperacao(response) {

        cellformulario.progressOff();

        if (response._situacao === 'Estoque atualizado' || response._situacao === 'Saída de estoque autorizada.') {
            form.clear();
            form.setFormData({});
            form.setItemValue('id', null);
            form.setItemValue('quantidade', null);
            form.setItemValue('descricao', null);
            form.setItemValue('ultima_compra', null);
            form.setItemValue('modelo', null);
            form.getContainer('foto').innerHTML = null;


            dhtmlx.message({
                text: response._situacao
            });

            gridhist.clearAll();
            that.PesquisaHistorico(itemestoque, function (listahistorico) {
                if (!listahistorico)
                    return;

                gridhist.parse(listahistorico,"json");
            });

        } else {
            dhtmlx.alert({
                title:"GMI",
                type:"alert-error",
                text:response._situacao
            });
        }

    }

    function MontaGridHistorico(cell) {

        cell.detachObject(true);

        gridhist = cell.attachGrid();
        gridhist.setImagePath("./img/grid/operacoes/");
        gridhist.setHeader(['Op', 'Data', 'Qtd. Anterior', 'Qtd. Alterado', 'Em estoque', 'Solicitante']);
        gridhist.setColTypes('img,ro,ron,ron,ron,ro');
        gridhist.setColSorting('na,na,int,int,int,str');
        gridhist.setColAlign("center,center,center,center,center,left");
        gridhist.setInitWidths("50,150,");
        gridhist.enableSmartRendering(true);
        gridhist.enableMultiselect(true);
        gridhist.init();

        LimpaSelecoes();

        cellpesquisa.progressOn();
        that.Listar(function (listaestrutura) {

            cellpesquisa.progressOff();

            if (listaestrutura === null)
                return;

            gridestoque.parse(listaestrutura,"json");
        });

    }

    this.PesquisaHistorico = function(id, Callback) {

        webservice.Request({
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: '*',
                from: 'gmi.lista_historico',
                where: 'idestoque='+id
            })
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                Callback(null);
                return;
            }

            Callback(webservice.PreparaGrid('query',http.response));
        });
    };

    this.Listar = function (Callback) {

        webservice.Request({
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: 'id,descricao',
                from: 'gmi.lista_cadastro',
                order: 'descricao'
            })
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                Callback(null);
                return;
            }

            Callback(webservice.PreparaGrid('query',http.response));
        });

    };

    this.Info = function (id, Callback) {

        webservice.Request({
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: '*',
                from: 'gmi.operacao_info',
                where: 'id='+id
            })
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                Callback(null);
                return;
            }

            Callback(webservice.PreparaLista('query',http.response));
        });

    };

};

/**
 * @return {boolean}
 */
function NumeroPositivo(data) {
    return (data>0);
}

let formoperacoes = [
    {type: 'settings', offsetTop:0, offsetLeft:0, labelAlign: 'right'},
    {type: 'hidden', name: 'estrutura'},
    {type: 'block', list:[
        {type: 'container', name: 'foto', inputHeight:128, inputWidth:128 },
        {type: 'newcolumn', offset: 0},
        {type: 'template', name: 'id', label: 'Código:'},
        {type: 'template', name: 'descricao', label: 'Descrição:'},
        {type: 'template', name: 'ultima_compra', label: 'Última entrada:'},
        {type: 'template', name: 'modelo', label: 'Modelo:'},
    ]},
    {type: 'label', label:'Registrar nova operação', list:[
        {type: 'template', name: 'quantidade', label: 'Em estoque:'},
        {type:"input", name:"quantidade_informada", validate:"NumeroPositivo", required:true, label:"Quantidade.:"},
        {type:"input", name:"solicitante", label:"Solicitante:"}
    ]}
];