const CACHE_NAME = "puntualizate-v3";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./lan-zhan.png",
    "./icon-192.png",
    "./icon-512.png"
];


/* ==========================================
   INSTALACIÓN
========================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(ARCHIVOS);

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


/* ==========================================
   ACTIVACIÓN Y LIMPIEZA DE VERSIONES ANTERIORES
========================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* ==========================================
   CARGA DE ARCHIVOS
========================================== */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(respuesta => {

                if (respuesta) {
                    return respuesta;
                }

                return fetch(event.request);

            })
            .catch(() => {

                return caches.match("./index.html");

            })

    );

});


/* ==========================================
   NOTIFICACIONES
========================================== */

self.addEventListener("notificationclick", event => {

    event.notification.close();

    event.waitUntil(

        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        })

        .then(lista => {

            for (const cliente of lista) {

                if ("focus" in cliente) {

                    return cliente.focus();

                }

            }

            if (clients.openWindow) {

                return clients.openWindow(
                    "./index.html"
                );

            }

        })

    );

});


/* ==========================================
   RECIBIR MENSAJES DESDE INDEX.HTML
========================================== */

self.addEventListener("message", event => {

    if (!event.data) {
        return;
    }


    if (event.data.tipo === "NOTIFICACION") {

        const titulo =
            event.data.titulo ||
            "Puntualízate";


        const opciones = {

            body:
                event.data.mensaje ||
                "Tienes una actividad pendiente.",

            icon: "./icon-192.png",

            badge: "./icon-192.png",

            vibrate: [
                200,
                100,
                200
            ],

            tag:
                event.data.tag ||
                "puntualizate",

            renotify: true

        };


        event.waitUntil(

            self.registration.showNotification(
                titulo,
                opciones
            )

        );

    }

});
