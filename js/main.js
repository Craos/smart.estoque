let webservice = new Webservice(), usuariocorrente;
dhtmlxEvent(window, 'load', function () {

    console.info('versão 2.0');

    if (!sessionStorage.user) {
        window.location = '../smart.auth/auth.html?system=smart.gmi';
        return;
    }

    usuariocorrente = JSON.parse(sessionStorage.user);

    let gmi = new GMI();
    gmi.MontaLayout();

});

let GMI = function () {

    let that = this, siderbar;

    this.MontaLayout = function() {

        siderbar = new dhtmlXSideBar({
            parent: document.body,
            template: 'icons_text',
            icons_path: 'img/siderbar/',
            single_cell: false,
            width: 80,
            header: true,
            autohide: false,
            items: [
                {
                    id: 'gestor',
                    text: 'Dashboard',
                    icon: 'gestor.png',
                    selected: true
                },
                {
                    id: 'cadastro',
                    text: 'Cadastro',
                    icon: 'cadastro.png',
                    selected: false
                },
                {
                    id: 'operacoes',
                    text: 'Operações',
                    icon: 'operacoes.png',
                    selected: false
                }/*,
                {
                    id: 'inventario',
                    text: 'Inventário',
                    icon: 'inventario.png'
                }*/
            ]

        });

        siderbar.attachEvent('onSelect', function(id) {
            that.SelecionarOpcao(id);
        });

        that.SelecionarGestor();
    };

    this.SelecionarOpcao = function(id) {
        switch (id) {
            case 'gestor':
                that.SelecionarGestor();
                break;
            case 'cadastro':
                that.SelecionarCadastro();
                break;
            case 'operacoes':
                that.SelecionarOperacoes();
                break;
        }
    };

    this.SelecionarGestor = function () {

        siderbar.cells('gestor').progressOn();
        webservice.Request({
            process: 'gmi.gestor',
            params: JSON.stringify({})
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                return;
            }

            let gestor = new Gestor(JSON.parse(JSON.parse(http.response)[0].gestor)[0]);
            gestor.MontaLayout(siderbar.cells('gestor'), function () {
                siderbar.cells('gestor').progressOff();
            });


        });

    };

    this.SelecionarCadastro = function () {
        let cadastro = new Cadastro();
        cadastro.MontaLayout(siderbar.cells('cadastro'));
    };

    this.SelecionarOperacoes = function () {
        let operacoes = new Operacoes();
        operacoes.MontaLayout(siderbar.cells('operacoes'));
    }

};