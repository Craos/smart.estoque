let Estrutura = function () {

    this.Listar = function(Callback) {

        if (sessionStorage.estrutura !== undefined) {
            Callback(webservice.PreparaLista('query',sessionStorage.estrutura));
            return;
        }

        webservice.Request({
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: '*',
                from: 'gmi.estrutura',
                order: 'id'
            })
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                Callback(null);
                return;
            }

            sessionStorage.estrutura = http.response;
            Callback(webservice.PreparaLista('query',sessionStorage.estrutura));
        });

    }


};