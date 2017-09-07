(function() {
    'use strict';

    var vm = new Vue({
        el : 'main',
        data : function() {
            return {
                socket      : null,
                user        : {},
                messages    : [],
                userList    : [],
                messageText : ''
            }
        },
        methods : {
            init : function() {
                this.socket = io.connect('/');

                this.socket.on('message', this.onMessage.bind(this));
                this.socket.on('userInfos', this.onUserInfos.bind(this));
                this.socket.on('updateUserList', this.onUpdateUserList.bind(this));
            },

            postMessage : function() {
                // Création de l'objet message
                var message = {
                    pseudo : this.user.pseudo,
                    text : this.messageText,
                    dateCreated : Date.now()    
                };

                // Ajout à la liste de messages Vue.js
                this.messages.push(message);

                // Envoi du message au serveur, pour qu'il le re-dispatche aux autres
                this.socket.emit('message', message);

                // Reset du champs de formulaire
                this.messageText = '';
            },

            // A la réception d'un message du serveur, on l'ajoute à la liste Vue.js
            onMessage : function(data) {
                this.messages.push(data);
            },

            // Le serveur nous renvoie les informations concernant notre profil (pseudo et socketId) pour les utiliser dans l'interface HTML/CSS
            onUserInfos : function(userInfos) {
                this.user = userInfos;
            },

            // Le serveur envoie une maj de la liste des utilisateurs connectés, qu'on recharge avec Vue.js
            onUpdateUserList : function(userList) {
                this.userList = userList;
            }
        },
        mounted : function() {
            this.$refs.message.focus();

            this.init();
        }
    })

})();