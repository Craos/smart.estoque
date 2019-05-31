let Gestor = function (info) {

    let that = this, colunas, colunaesquerda, colunadireita;

    this.MontaLayout = function (container, Callback) {

        colunas = container.attachLayout({
            pattern: '2U',
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
                    fix_size: [true, true]
                },
                {
                    id: 'b',
                    header: false,
                    fix_size: [true, true]
                }
            ]
        });

        colunaesquerda = colunas.cells('a').attachLayout({
            pattern: '2E',
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
                    height: 200,
                    fix_size: [true, true]
                },
                {
                    id: 'b',
                    header: false,
                    fix_size: [true, true]
                }
            ]
        });

        colunadireita = colunas.cells('b').attachLayout({
            pattern: '4U',
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
                    height: 80,
                    fix_size: [true, true]
                },
                {
                    id: 'b',
                    header: false,
                    fix_size: [true, true]
                },
                {
                    id: 'c',
                    header: false,
                    fix_size: [true, true]
                },
                {
                    id: 'd',
                    header: false,
                    fix_size: [true, true]
                }
            ]
        });

        that.MontaNumeroPrincipal();
        that.MontaNumerosSecundarios();
        that.MontaGraficosCategorias();
        Callback();

    };

    that.MontaNumeroPrincipal = function () {

        colunaesquerda.attachEvent("onContentLoaded", function(id) {

            let ifresq = colunaesquerda.cells(id).getFrame();

            if (id === 'a') {

                ifresq.contentWindow.document.getElementById("itens").innerHTML = info.itens;
                ifresq.contentWindow.document.getElementById("saldo").innerHTML = info.saldo;

            } else if (id === 'b') {

                let containerlista = ifresq.contentWindow.document.getElementById("dashboard-listestrutura");
                let list = new dhtmlXList({
                    container:containerlista,
                    type:{
                        template:"http->./html/dashboard_categoria.html",
                        height:60
                    }
                });
                list.parse(info.resumo_estrutura,"json");

            }

        });

        colunaesquerda.cells('a').attachURL('./html/dashboard_resumo.html');
        colunaesquerda.cells('b').attachURL('./html/dashboard_estrutura.html');

    };

    that.MontaNumerosSecundarios = function () {

        colunadireita.attachEvent("onContentLoaded", function(id){

            let ifrsec = colunadireita.cells(id).getFrame();
            let fluxo = info.fluxo[0];
            if (id === 'a') {
                ifrsec.contentWindow.document.getElementById("entrada").innerHTML = parseFloat(fluxo.entrada.toFixed(2));
            } else if (id === 'b') {
                ifrsec.contentWindow.document.getElementById("saida").innerHTML = parseFloat(fluxo.saida.toFixed(2));
            } else {
                ifrsec.contentWindow.document.getElementById("critico").innerHTML = parseFloat(fluxo.critico.toFixed(2));
            }

        });

        colunadireita.cells('a').attachURL('./html/dashboard_entrada.html');
        colunadireita.cells('b').attachURL('./html/dashboard_saida.html');
        colunadireita.cells('c').attachURL('./html/dashboard_critico.html');

    };

    that.MontaGraficosCategorias = function () {

        let linha = colunadireita.cells('d').attachLayout({
            pattern: '1C',
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
                    height: 300,
                    fix_size: [true, true]
                }
            ]
        });

        linha.attachEvent("onContentLoaded", function(id) {

            let ifrgrfluxo = linha.cells(id).getFrame();
            let container = ifrgrfluxo.contentWindow.document.getElementById("dashboard-grfluxo");

            let myAreaChart =  new dhtmlXChart({
                view:"area",
                container:container,
                value:"#entrada#",
                color:"#36abee",
                alpha:0.3,
                label:"#id#",
                padding: {
                  bottom:40
                },
                legend:{
                    values:[
                        {text:"Entrada",color:"#1e88cf"},
                        {text:"Saída",color:"#4ef996"}
                    ],
                    layout:"x",
                    width: 45,
                    align:"center",
                    valign:"bottom",
                    marker:{
                        type:"round",
                        width:15
                    }
                },
                xAxis:{
                    template:"#mes#"
                },
                yAxis:{
                    start:0,
                    end:info.grfluxoinfo[0].maximo + 21,
                    step:10,
                    template:function(obj){
                        return (obj%20?"":obj)
                    }
                }
            });

            myAreaChart.addSeries({
                alpha:0.5,
                value:"#entrada#",
                color:"#1e88cf"
            });

            myAreaChart.addSeries({
                alpha:0.3,
                value:"#saida#",
                color:"#4ef996"
            });

            myAreaChart.parse(info.grfluxo,"json");

        });

        linha.cells('a').attachURL('./html/dashboard_grfluxo.html');


    };


};