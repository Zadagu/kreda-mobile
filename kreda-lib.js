/*
 Kreda-Mobile Webapplication for Smartphones and Tablets to access Kreda
 Copyright (C) 2014  Kilian Ulrichsohn
 This Source was puplished under the Kreda-Mobile License.
 You should find a version of the license in a file called "LICENSE".
 */

/*
 * Prototyping:
 */
/**
 * Array.keys()
 * returns the keys in array
 */
Object.defineProperty(Array.prototype, "keys", {
    value: function() {
        var result = [];
        for(var key in this){
            if(!Array.prototype.hasOwnProperty(key))
                result[result.length] = key;
        }
        return result;
    }
});
/**
 * The kreda module
 * @namespace
 */
var kreda = {
    /** @namespace */
    cfg: {
        debug: true,
        schooldevice: false,
        /**
         * dateToTimeString formatiert ein Date zu einen Zeit String
         * Diese Funktion kann überschrieben werden, um global die Datums/Zeitformatierung zu ändern
         * Standardformat Stunde:MinuteMinute in 24h
         * @param jsdate {Date}
         * @returns {string}
         */
        dateToTimeString: function(jsdate) {
            return jsdate.getHours() + ":" + ((jsdate.getMinutes().toString().length == 1) ? ("0" + jsdate.getMinutes()) : jsdate.getMinutes());
        },
        /**
         * dateWithoutYearToString formatiert ein Date zu einen Datum String ohne Jahr
         * Diese Funktion kann überschrieben werden, um global die Datums/Zeitformatierung zu ändern
         * Standardformat Tag.MonatMonat in 24h
         * @param jsdate {Date}
         * @returns {string}
         */
        dateWithoutYearToString: function(jsdate) {
            return jsdate.getDate() + '.' + (((jsdate.getMonth() + 1).toString().length == 1) ? ("0" + (jsdate.getMonth() + 1)) : (jsdate.getMonth() + 1));
        },
        /** dateString formatiert ein Date zu einen Datum String
         * Diese Funktion kann überschrieben werden, um global die Datums/Zeitformatierung zu ändern
         * Standardformat Tag.MonatMonat.JahrJahrJahrJahr in 24h
         * @param jsdate {Date}
         * @returns {string}
         */
        dateString: function(jsdate) {
            return kreda.cfg.dateWithoutYearToString(jsdate) + '.' + jsdate.getFullYear();
        }
    },
    /** @namespace */
    ui: {
        /** hochformat
         * informiert über das Seitenverhältnis des Fensters
         * @returns {boolean}
         */
        hochformat: function() {
            if(window.innerWidth < 600)
                return true;
            return window.innerWidth < window.innerHeight;
        },
        /**
         * Öffnet ein Popup in dem der Name eines Zufälligen Schülers steht.
         * @param jqueryobj {jQuery}
         */
        randSchueler: function(jqueryobj) {
            var keys = kreda.storage.dieseStunde.schueler.keys();
            if(keys.length > 0) {
                var t = "";
                var schueler = kreda.storage.dieseStunde.schueler[keys[Math.floor(Math.random() * keys.length)]];
                t += schueler.vorname + " " + schueler.name + "<br>";
                schueler = kreda.storage.dieseStunde.schueler[keys[Math.floor(Math.random() * keys.length)]];
                t += schueler.vorname + " " + schueler.name + "<br>";
                schueler = kreda.storage.dieseStunde.schueler[keys[Math.floor(Math.random() * keys.length)]];
                t += schueler.vorname + " " + schueler.name;
                jqueryobj.html(t);
            }
            else {
                jqueryobj.text("Keine Unterrichtsstunde ausgewählt!");
            }
        },
        /**
         * aktualisiert anhand der geladenen Stunde den Seitentitel
         */
        setTitle: function() {
            if (kreda.storage.dieseStunde.plan)
                var txt = kreda.storage.dieseStunde.fachklasse.name;
            else
                var txt = "Kreda Mobile";
            txt += " - " + kreda.cfg.dateString(new Date());
            $("#title").html(txt);
            document.title = txt;
        },
        /**
         * aktualisiert die Ansicht, versteckt Elemente die nur im Querformat sichtbar sein sollen,
         * wenn sich die Ansicht im Hochformat befindet.
         */
        updateView: function() {
            if(kreda.ui.hochformat() == true)
                $( '.kreda-querformat' ).hide();
            else
                $( '.kreda-querformat' ).show();
            kreda.ui.dieseStunde.updateProgressbar();
        },
        loadContent: function() {
            $(".kreda-pre-rendered").each(function() {
                kreda.storage.store.content.initializeContent($(this));
            });
        },
        loadImages: function() {
            $(".kreda-saved-image").each(function(){
                kreda.storage.store.pictures.initializeImage(this);
            })
        },
        /**
         * Öffnet ein Popup mit der Fehlermeldung
         * @param msg {string}
         * @param title {?string}
         */
        raiseError: function(msg, title) {
            var popup = $("#popup-error");
            popup.find(".exception").text(msg);
            if(title)
                popup.find(".title").text(title);
            else
                popup.find(".title").text("Es ist ein Fehler aufgetreten!");
            popup.popup("open", {positionTo: "window"});
        },
        /** Öffnet das Contentpopup, welches die Stoffverteilung zeigt */
        displayStoffverteilung: function() {
            if(kreda.storage.dieseStunde.fachklasse)
                kreda.ui.contentPopup.show("stoffverteilung-" + kreda.storage.dieseStunde.fachklasse.id);
            else
                kreda.ui.raiseError("Es kann keine Stoffverteilung angezeigt werden, da keine Unterrichtsstunde geladen ist.");
        },
        /** @namespace */
        sitzplan: {
            /** @type {?jQuery} */
            ablage: null,
            /** @type {?jQuery} */
            sitzplan: null,
            /** @type {?jQuery} */
            popup: null,
            /**
             * Eventhandler für das Drop-Ereignis im Sitzplan auf den Sitplätzen
             * @param event {Event}
             * @param ui
             * @returns {boolean}
             */
            drop: function(event, ui) {
                var element = ui.draggable.context.outerHTML;
                var id = ui.draggable.context.id;
                var dropable = $( '#' +  this.id );
                ui.draggable.context.remove();
                if(dropable.html() == "") {
                    dropable.html(element);
                    var neu = $( '#' + id );
                    neu.css('left', 0);
                    neu.css('top', 0);
                    neu.draggable();
                }
                else {
                    kreda.ui.sitzplan.putIntoAblage( dropable.html(), dropable.children().attr("id") );
                    dropable.html( element );
                    var neu = $( '#' + id);
                    neu.css( 'left', 0 );
                    neu.css( 'top', 0 );
                    neu.draggable();
                }
                return true;
            },
            /**
             * Eventhandler für das Drop-Ereignis im Sitzplan auf der Ablage
             * @param event {Event}
             * @param ui
             * @returns {boolean}
             */
            dropAblage: function(event, ui) {
                var element = ui.draggable.context.outerHTML;
                var id = ui.draggable.context.id;
                var dropable = kreda.ui.sitzplan.ablage;
                ui.draggable.context.remove();
                dropable.append( element );
                var neu = $('#' + id);
                neu.css('left', 0);
                neu.css('top', 0);
                neu.draggable();
                return true;
            },
            /**
             * fügt ein Schüler in die Ablage ein
             * @param html {String}
             * @param id {Number}
             */
            putIntoAblage: function(html, id) {
                kreda.ui.sitzplan.ablage.append( html );
                var neu = $( '#' + id);
                neu.css( 'left', 0 );
                neu.css( 'top', 0 );
                neu.draggable();
            },
            /**
             * Füllt den Sitzplan mit Schuelern
             * @param {function} rendermethod
             * @param {boolean} [ablageaktiv=true]
             */
            fillSitzplan: function(rendermethod, ablageaktiv) {
                ablageaktiv = ablageaktiv || true;
                kreda.ui.sitzplan.ablage.html("");
                for(schueler in kreda.storage.dieseStunde.schueler) {
                    if(typeof kreda.storage.dieseStunde.sitzplaetze[schueler] === 'object')
                        $('#p-' + kreda.storage.dieseStunde.sitzplaetze[schueler].sitzplatz_id).html(rendermethod(schueler));
                    else
                        if(ablageaktiv)
                            kreda.ui.sitzplan.ablage.append(rendermethod(schueler));
                }
            },
            /**
             * gibt den Schüler als HTML wieder, sodass er in den Sitzplan eingefügt werden kann.
             * @param schueler {number} schüler id
             * @returns {string}
             */
            schuelerHtmlEdit: function(schueler) {
                var result = "<div id=\"s-" + kreda.storage.dieseStunde.schueler[schueler].id + "\" class=\"kreda-sitzplan-schueler ui-draggable\" style=\"position: relative;\" data-sid=\"" + schueler + "\"><div class=\"kreda-schueler-name\">";
                result += kreda.storage.dieseStunde.schueler[schueler].vorname + " " + kreda.storage.dieseStunde.schueler[schueler].name;
                result += "</div></div>";
                return result;
            },
            /**
             * gibt den Schüler als HTML wieder, sodass er in den Sitzplan eingefügt werden kann.
             * @param schueler {number} schüler id
             * @returns {string}
             */
            schuelerHtmlFehlend: function(schueler) {
                var name = '"schueler-' + kreda.storage.dieseStunde.schueler[schueler].id + '"';
                var checked = (kreda.storage.dieseStunde.fehlstunden[schueler] == null) ? "" : ' checked="checked" ';
                var result = '<div class="sitzplan-fehlend-schueler"><fieldset data-role="controlgroup" data-type="horizontal"><input type="checkbox" name=' + name + ' id=' + name + ' class="sitzplan-fehlend-cb ui-icon-delete" ' + checked + ' data-sid="' + schueler + '">';
                result += '<label for=' + name + '>';
                result += kreda.storage.dieseStunde.schueler[schueler].vorname + " " + kreda.storage.dieseStunde.schueler[schueler].name;
                result += "</label></fieldset></div>";
                return result;
            },
            /**
             * aktiviert drag&drop im Sitzplan, sodass Änderungen möglich werden
             */
            activateEdit: function() {
                try{
                    $( '.kreda-sitzplan-schueler' ).draggable();
                    $( '.kreda-sitz-platz' ).droppable({ drop: kreda.ui.sitzplan.drop });
                    kreda.ui.sitzplan.ablage.droppable({ drop: kreda.ui.sitzplan.dropAblage });
                }
                catch (e){}
            },
            /**
             * Speichert die Position aller Schüler im Sitzplan. Die Reihenfolge der Schüler in der Ablage geht dabei verloren.
             * @param {QDBCounter} [counter]
             */
            save: function(counter) {
                if(kreda.storage.dieseStunde.plan != null) {
                    var savecounter = new QDBCounter(counter);
                    savecounter.onFinish(function(){
                        kreda.storage.dieseStunde.ladeSitzplan();
                    });
                    savecounter.add();
                    var rmlist = [];
                    kreda.ui.sitzplan.sitzplan.find('.kreda-sitz-platz').each( function() {
                        var platz = $(this);
                        var children = platz.children('.kreda-sitzplan-schueler');
                        if(children.length == 1) {
                            var sid = parseInt($( children[0] ).attr('data-sid'));
                            var pid = parseInt(platz.attr('data-pid'));
                            kreda.storage.store.sitzplan_platz.save(pid, kreda.storage.dieseStunde.sitzplan_klasse.id, sid, savecounter);
                        }
                        else
                            rmlist[rmlist.length] = parseInt(platz.attr('data-pid'));
                    });
                    if(rmlist.length > 0) {
                        savecounter.add();
                        var c = new QDBQuery(kreda.storage.idb);
                        c.onFinish(function() {
                            kreda.storage.store.changes.saveListQuiet("sitzplan_platz", c.result, kreda.storage.store.changes.DELETED, savecounter);
                            savecounter.finishedOperation();
                        });
                        c.remove("sitzplan_platz", {sitzplatz_id: rmlist, sitzplan_klasse: kreda.storage.dieseStunde.sitzplan_klasse.id});
                    }


                    var removelist = [];
                    kreda.ui.sitzplan.ablage.children( '.kreda-sitzplan-schueler').each( function() {
                        removelist.push( parseInt($(this).attr('data-sid')) );
                    });
                    if(removelist.length > 1) {
                        savecounter.add();
                        var removequery = new QDBQuery(kreda.storage.idb);
                        removequery.onFinish(function() {
                            kreda.storage.store.changes.saveListQuiet("sitzplan_platz", removequery.result, kreda.storage.store.changes.DELETED, savecounter);
                            savecounter.finishedOperation();
                        });
                        removequery.remove("sitzplan_platz", {sitzplan_klasse: kreda.storage.dieseStunde.sitzplan_klasse.id, schueler: removelist});
                    }

                    savecounter.finishedOperation();
                }
            },
            saveFehlstunden: function(counter) {
                $('.sitzplan-fehlend-cb').each(function() {
                    var sid = parseInt($(this).attr("data-sid"));
                    var val = $(this).prop("checked");
                    var c1 = new QDBQuery(kreda.storage.idb);
                    c1.onFinish(function(){
                        if(c1.result.length == 0 && val == true) {
                            kreda.storage.store.schueler_fehlt.add(sid, kreda.storage.dieseStunde.plan.id, false, counter);
                        }
                        if(c1.result.length == 1 && val == false) {
                            var c2 = new QDBQuery(kreda.storage.idb);
                            c2.remove("schueler_fehlt", {"schueler": sid, "stunde": kreda.storage.dieseStunde.plan.id}, counter)
                        }
                    });
                    c1.get("schueler_fehlt", {"schueler": sid, "stunde": kreda.storage.dieseStunde.plan.id}, null, counter);
                });
            },
            showEdit: function() {
                try{
                    kreda.ui.sitzplan.sitzplan.html(kreda.storage.dieseStunde.sitzplan_html);
                    kreda.ui.sitzplan.fillSitzplan(kreda.ui.sitzplan.schuelerHtmlEdit, true);
                    kreda.ui.sitzplan.activateEdit();
                    kreda.ui.sitzplan.popup.popup("open", {positionTo: "window"});
                    kreda.ui.sitzplan.handleclosed = function() {
                        kreda.log("speichere Sitzplan");
                        kreda.ui.sitzplan.save();
                    };
                }
                catch (e) {}
            },
            showFehlend: function() {
                kreda.ui.sitzplan.sitzplan.html(kreda.storage.dieseStunde.sitzplan_html);
                kreda.ui.sitzplan.fillSitzplan(kreda.ui.sitzplan.schuelerHtmlFehlend, true);
                var c = new QDBQuery(kreda.storage.idb);
                c.onFinish(function(){
                    $(".sitzplan-fehlend-cb").each(function(){
                        var e = $(this);
                        var sid = parseInt(e.attr("data-sid"));
                        e.checkboxradio();
                        if(c.result.keys().indexOf(sid) != -1)
                            e.prop( "checked", true ).checkboxradio( "refresh" );
                    });
                    $(".sitzplan-fehlend-cg").controlgroup();

                    kreda.ui.sitzplan.popup.popup("open", {positionTo: "window"});
                });
                c.get("schueler_fehlt", {"stunde": kreda.storage.dieseStunde.plan.id}, "schueler");

                kreda.ui.sitzplan.handleclosed = function() {
                    kreda.log("speichere Fehlstunden");
                    var counter = new QDBCounter();
                    counter.onFinish(function(){
                        kreda.log("Fehlstunden gespeichert");
                    });
                    kreda.ui.sitzplan.saveFehlstunden(counter);
                };
            },
            handleclosed: function() {}
        },
        /** @namespace */
        menu: {
            displayStunden: function() {
                var result = '';
                var menu = $('#stundenmenu');
                kreda.storage.menu.stundenEntries.forEach(function (stunde) {
                    var datum = new Date(stunde.datum);
                    var datumstr = ' ' + kreda.cfg.dateWithoutYearToString(datum) + ' ' + kreda.cfg.dateToTimeString(datum);
                    result += '<li><a href="javascript:kreda.ui.menu.stundenKlick(' + stunde.id + ');">' + kreda.storage.menu.fachklasseEntries[stunde.fachklasse].name + datumstr + '</a></li>';
                });
                //result += ''; //'</ul>';
                menu.html(result);
                menu.listview("refresh");
                //$("#home").trigger("pagecreate");
            },
            displayKlassen: function() {
                var result = '';
                for(var i in kreda.storage.menu.fachklasseEntries)
                    result += '<li><a href="#">' + kreda.storage.menu.fachklasseEntries[i].name + '</a></li>';
                var menu = $('#fachklassemenu');
                menu.html(result);
                menu.listview("refresh");
            },
            stundenKlick: function(id) {
                $("#right-panel-menu").panel("close");
                kreda.storage.dieseStunde.ladePlanByID(id);
            }
        },
        /** @namespace */
        dieseStunde: {
            renderPlan: function() {
                var html = "<table class='plan einzelstunde' id='unterrichtsabschnitte'><tbody>";
                var begin = kreda.storage.dieseStunde.getBegin().getTime();
                var minutes = 0;
                for(var i in kreda.storage.dieseStunde.abschnittsplaene) {
                    var plan = kreda.storage.dieseStunde.abschnittsplaene[i];
                    var start = new Date(begin + minutes * 60000);
                    minutes += plan.minuten;
                    html += "<tr><td class='zeit'>";
                    html += kreda.cfg.dateToTimeString(start) + "<br><div class='minutes'>(" + plan.minuten + "min)</div>";
                    html += "</td><td class='progress' id='progress-outer-" + i + "'>";
                    html += "<div id='progress-" + i + "' class='kreda-progressbar'></div>"; //position als ID, damit über js das ganze gestreckt werden kann
                    html += "</td><td class='content'>";
                    if(plan.abschnitt == 0)
                        html += plan.bemerkung;
                    else
                        html += kreda.storage.dieseStunde.abschnitte[plan.abschnitt].value;
                    html += "</td></tr>";
                }
                html += "</tbody></table>";
                return html;
            },
            displayPlan: function() {
                try {// Kann einen Fehler werfen obwohl korrekt ausgefuehrt. Try wird benoetigt damit nachfolgender Code auch ausgefuehrt wird.
                    $('.kreda-dieseStunde-rendered').html(kreda.ui.dieseStunde.renderPlan());
                }catch (e) {}
            },
            updateProgressbar: function() {
                if(kreda.storage.dieseStunde.abschnittsplaene.length > 0){
                    var begin = kreda.storage.dieseStunde.getBegin().getTime();
                    var minutes = 0;
                    var i;
                    for(i in kreda.storage.dieseStunde.abschnittsplaene){
                        var end = begin + minutes + (kreda.storage.dieseStunde.abschnittsplaene[i].minuten * 60000);
                        if(end > Date.now()) {
                            break;
                        }
                        else {
                            // var padding = plan.css("padding");
                            var outer = $("#progress-outer-" + i);
                            var padding = parseInt(outer.css("padding-top")) + parseInt(outer.css("padding-bottom"));
                            var maxheight = outer.innerHeight() - padding;
                            $('#progress-' + i).css("height", maxheight + "px");
                            minutes += (kreda.storage.dieseStunde.abschnittsplaene[i].minuten * 60000);
                        }
                    }
                    var outer = $("#progress-outer-" + i);
                    var padding = parseInt(outer.css("padding-top")) + parseInt(outer.css("padding-bottom"));
                    var maxheight = outer.innerHeight() - padding;
                    var faktor = maxheight / kreda.storage.dieseStunde.abschnittsplaene[i].minuten;
                    var v = (Date.now() - (begin + minutes)) / 60000;
                    if(v > kreda.storage.dieseStunde.abschnittsplaene[i].minuten)
                        v = kreda.storage.dieseStunde.abschnittsplaene[i].minuten;
                    $('#progress-' + i).css("height", (faktor * v) + "px");
                }
            },
            progressTick: function() {
                kreda.ui.dieseStunde.updateProgressbar();
                setTimeout(kreda.ui.dieseStunde.progressTick, 10000);
            },
            renderHausaufgaben: function() {
                var html = "";
                for(var hausaufgabe in kreda.storage.dieseStunde.hausaufgaben){
                    html += "<a href=\"#\" class=\"ui-btn ui-corner-all ui-icon-kreda-hausaufgaben ui-btn-icon-left kreda-controlgroup\" data-role=\"button\" >";
                    html += kreda.storage.dieseStunde.hausaufgaben[hausaufgabe].ziel;
                    html += "</a>";
                }
                html += "<a href=\"#\" class=\"ui-btn ui-corner-all ui-icon-kreda-hausaufgaben ui-btn-icon-left kreda-controlgroup\" data-role=\"button\" >neu</a>";
                return html;
            },
            displayHausaufgaben: function() {
                var container = $("#hausaufgaben");
                container.html(kreda.ui.dieseStunde.renderHausaufgaben());
                container.removeClass("ui-corner-all").addClass("ui-corner-all");
            }
        },
        /** @namespace */
        progressPopup: {
            /**
             * Öffnet das Popup
             * @param msg {string}
             * @param counter {QDBCounter}
             */
            show: function(msg, counter) {
                var popup = $("#popup-progress");
                var bar = $("#content-transfer-progressbar");
                var zeit = $("#content-transfer-zeit");
                popup.find(".title").text(msg);
                counter.onTick(function(_this){
                    var percent = (_this.progressPercent() * 100).toString();
                    bar.css("width", percent + "%");
                    zeit.text("verstrichene Zeit: " + _this.getSeconds().toFixed(1) + "s");
                });
                counter.onFinish(function(_this){
                    zeit.text("Gesamtzeit: " + _this.getSeconds().toFixed(1) + "s");
                    popup.popup("option", "dismissible", true);
                    bar.text("Fertig ;)");
                });
                bar.css("width", "0");
                bar.text("");
                popup.popup("open", {positionTo: "window"});
                popup.popup("option", "dismissible", false);
            }
        },
        /** @namespace */
        contentPopup: {
            /**
             * Öffnet das Popup
             * @param contentid {string}
             * @param dismissible {boolean}
             */
            show: function(contentid, dismissible) {
                var popup = $("#popup-var-content");
                popup.attr("data-content-id", contentid);
                var c = new QDBCounter();
                c.onFinish(function(){
                    popup.popup("option", "dismissible", dismissible);
                    popup.popup("open", {positionTo: "window"});
                });
                kreda.storage.store.content.initializeContent(popup, c);
            },
            close: function() {
                $("#popup-var-content").popup("close");
            }
        }
    },
    /** @namespace */
    storage: {
        /**
         * @type {IDBDatabase}
         */
        idb: null,
        /**
         * Erstellt einen Object Store
         * @param idb {IDBDatabase} in update mode
         * @param storeobj Name oder Objekt
         * @param keys
         */
        createStore: function(idb, storeobj, keys){
            var storename = "";
            if(typeof storeobj === 'string')
                storename = storeobj;
            else if(typeof storeobj === 'object')
                storename = storeobj.name;
            if(!idb.objectStoreNames.contains(storename))
            {
                var store;
                if(typeof storeobj === 'string')
                    store = idb.createObjectStore(storeobj);
                else if(typeof storeobj === 'object')
                    store = idb.createObjectStore(storeobj.name, storeobj);
                for(var i = 0; i < keys.length; i++) {
                    if(typeof keys[i] === 'string')
                        store.createIndex(keys[i], keys[i]);
                    else if(typeof keys[i] === 'object')
                        store.createIndex(keys[i].key, keys[i].key, keys[i].param);
                }
                kreda.log("Store '" + storename + "' wurde erstellt.");
            }
            else
                kreda.log("Store '" + storename + "' existiert bereits");
        },
        /** idbSupport gibt an, ob der Browser IDB unterstüzt
         * @returns {boolean}
         */
        idbSupport: function(){
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            return "indexedDB" in window;
        },
        /** upgrade Erstellt die Datenbankstruktur für Kreda
         * @param idb {IDBDatabase}
         */
        upgrade: function(idb){
            kreda.storage.createStore(idb, {name: "schueler", keyPath: "id"}, [ "name", "vorname", "geburtstag", "strasse", "ort", "klasse", "email", "telefon", "bemerkungen", "maennlich", "aktiv", "position", "geburtsort", "krankenkasse", "notfall", "username"]);
            kreda.storage.createStore(idb, {name: "content",  keyPath: "id"}, ["value"]);
            kreda.storage.createStore(idb, {name: "sitzplan",  keyPath: "id"}, [ "name", "aktiv", "user" ]);
            kreda.storage.createStore(idb, {name: "sitzplan_klasse",  keyPath: "id"}, [ "name", "klasse", "seit", "sitzplan" ]);
            kreda.storage.createStore(idb, {name: "sitzplan_platz",  keyPath: "id", autoIncrement: true}, [ "sitzplan_klasse", "sitzplatz_id", "schueler" ]);
            kreda.storage.createStore(idb, {name: "klasse", keyPath: "id"}, [ "einschuljahr", "endung", "schule", "schulart", "fehlzeiten_erledigt_bis" ]);
            kreda.storage.createStore(idb, {name: "fachklasse", keyPath: "id"}, ["klasse", "fach", "farbe", "name", "bewertungstabelle", "sitzplan_klasse", {key: "schueler", param: {multientry: true}}]);
            kreda.storage.createStore(idb, {name: "abschnittsplanung", keyPath: "id"}, ["abschnitt", "plan", "minuten", "position", "bemerkung"]);
            kreda.storage.createStore(idb, {name: "abschnitt", keyPath: "id"}, ["value", "nachbereitung", "minuten", "hefter"]);
            kreda.storage.createStore(idb, {name: "plan", keyPath: "id"}, ["datum", "schuljahr", "fachklasse", "nachbereitung", "zusatzziele", "gedruckt", "material_da", "ausfallgrund", "notizen", "vorbereitet", "bemerkung", "ustd", "alternativtitel", "struktur", "ueberschriftsbeginn", "ohne_pause", {key: "abschnittsplaene", param: {multientry: true}}]);
            kreda.storage.createStore(idb, {name: "hausaufgabe", keyPath: "id"}, ["ziel", "bemerkung", "abgabedatum", "kontrolliert", "plan", "aufgegeben_am", "fachklasse", "mitzaehlen", "value"]);
            kreda.storage.createStore(idb, {name: "hausaufgabe_vergessen", keyPath: "id"}, ["hausaufgabe", "schueler", "anzahl", "bemerkung", "erledigt"]);
            kreda.storage.createStore(idb, {name: "pictures", keyPath: "id"}, ["image", "imgtype"]);
            kreda.storage.createStore(idb, {name: "schueler_fehlt", keyPath: "id", autoIncrement: true}, ["schueler", "stunde", "entschuldigt"]);
            kreda.storage.createStore(idb, {name: "changes", keyPath: "id", autoIncrement: true}, ["store", "primary", "state"]);
        },
        /** @namespace */
        open: {
            onsuccess: function(e){
                kreda.storage.idb = e.target.result;
                kreda.log("Datenbank wurde erfolgreich geladen");
                kreda.event.callevent('open-database');
            },
            onupgradeneeded: function(e){
                kreda.log("Datenbank muss aktualisiert werden");
                var idb = e.target.result;
                kreda.storage.upgrade(idb);
                kreda.log("Aktualisierung abgeschlossen.");
            },
            onerror: function(e){
                kreda.log("Datenbank konnte nicht geladen werden");
            },
            openDB: function(version){
                if(kreda.storage.idbSupport())
                    var request = window.indexedDB.open("kreda", version);
                request.onsuccess = kreda.storage.open.onsuccess;
                request.onupgradeneeded = kreda.storage.open.onupgradeneeded;
                request.onerror = kreda.storage.open.onerror;
            }
        },
        /** insert Fügt ein Objekt in den gewählten Object-Store
         * @param {String} store
         * @param {Object} obj
         * @param {Number} id
         * @param {QDBCounter} [trans]
         */
        insert: function(store, obj, id, trans) {
            var transaction = kreda.storage.idb.transaction(store, 'readwrite').objectStore(store).add(obj);
            if(trans){
                trans.add();
                transaction.onsuccess = function(event) {
                    kreda.log("{kreda.storage.insert} " + store + ": " + id + " wurde gespeichert.");
                    trans.finishedOperation();
                };
                transaction.onerror = function(event) {
                    kreda.log("{kreda.storage.insert} " + store + ": " + id + " konnte nicht gespeichert werden.");
                    trans.failedOperation();
                };
            }
            else{
                transaction.onsuccess = function(event) { kreda.log("{kreda.storage.insert} " + store + ": " + id + " wurde gespeichert."); };
                transaction.onerror = function(event) { kreda.log("{kreda.storage.insert} " + store + ": " + id + " konnte nicht gespeichert werden."); };
            }
        },
        /** Ein assoziatives Array in der Datenbank speichern
         * @param assoc
         * @param trans {QDBCounter}
         */
        insertAssoc: function (assoc, trans) {
            for(var store in assoc){
                for(var datensatzindex in assoc[store]){
                    kreda.storage.insert(store, assoc[store][datensatzindex], null, trans);
                }
            }
        },
        /** dropDB löscht die komplette Datenbank und lädt die Seite neu
         */
        dropDB: function(){
            kreda.storage.idb.close();
            window.indexedDB.deleteDatabase("kreda");
            location.reload();
        },
        /** @namespace */
        dieseStunde: {
            /** @type {kreda.storage.store.plan} */
            plan: null,
            /** @type {?kreda.storage.store.klasse} */
            klasse: null,
            /** @type {?kreda.storage.store.fachklasse} */
            fachklasse: null,
            /** @type {Array.<kreda.storage.store.hausaufgabe>} */
            hausaufgaben: [],
            /** @type {Array.<kreda.storage.store.schueler>} */
            schueler: [],
            /** @type {?kreda.storage.store.sitzplan_klasse} */
            sitzplan_klasse: null,
            /** @type {?kreda.storage.store.sitzplan} */
            sitzplan: null,
            /** @type {Array.<kreda.storage.store.sitzplan_platz>} */
            sitzplaetze: [],
            /** @type {bool} */
            autoload: false,
            /** @type {Array.<kreda.storage.store.abschnittsplanung>} */
            abschnittsplaene: [],
            /** @type {Array.<kreda.storage.store.abschnitt>} */
            abschnitte: [],
            /** @type {string} */
            sitzplan_html: "",
            /** @type {Array.<kreda.storage.store.schueler_fehlt>} */
            fehlstunden: [],
            /**
             * activateLoader aktiviert das automatische Laden von Unterrichtsstunden
             */
            activateLoader: function() {
                if (!kreda.storage.dieseStunde.autoload){
                    kreda.storage.dieseStunde.autoload = true;
                    kreda.storage.dieseStunde.ladePlan();
                }
            },
            /**
             * deactivateLoader deaktiviert das automatische Laden von Unterrichtsstunden
             */
            deactivateLoader: function() {
                kreda.storage.dieseStunde.autoload = false;
            },
            /**
             * getBegin gibt den Beginn der Unterrichtsstunde zurück
             * @returns {Date}
             */
            getBegin: function() {
                return new Date(kreda.storage.dieseStunde.plan.datum);
            },
            ladePlan: function() {
                var handler = kreda.storage.idb.transaction('plan', 'readonly').objectStore('plan').openCursor();
                handler.onsuccess = function(e) {
                    var cursor = e.target.result;
                    if(cursor) {
                        var now = new Date().getTime();
                        var stunde = cursor.value.datum;
                        if(stunde < now && ((stunde + 2700000 * cursor.value.ustd) > now)) {// 2.700.000 = 1000 * 60 * 45
                            kreda.storage.dieseStunde.plan = cursor.value;

                            // erst wieder laden, wenn die Stunde vorbei ist:
                            kreda.storage.dieseStunde.deactivateLoader();
                            if(kreda.storage.dieseStunde.autoload)
                                setTimeout(kreda.storage.dieseStunde.activateLoader, 2700000 * cursor.value.ustd - (now - cursor.value.datum));
                            kreda.event.callevent("plan-geladen");
                            return 0;
                        }
                        else
                            cursor.continue();
                    }
                    else {
                        kreda.event.callevent('plan-nicht-geladen');
                        kreda.storage.dieseStunde.loader();
                    }
                };
                handler.onerror = function() {
                    kreda.event.callevent('plan-nicht-geladen');
                    kreda.storage.dieseStunde.loader();
                };
            },
            ladePlanByID: function(id) {
                kreda.storage.dieseStunde.deactivateLoader();
                var handler = kreda.storage.idb.transaction('plan', 'readonly').objectStore('plan').get(id);
                handler.onsuccess = function(e) {
                    kreda.storage.dieseStunde.plan = e.target.result;
                    if(e.target.result != null)
                        kreda.event.callevent("plan-geladen");
                    else
                        kreda.event.callevent('plan-nicht-geladen');
                };
                handler.onerror = function(e) {
                    kreda.event.callevent('plan-nicht-geladen');
                };
            },
            ladeAbschnittsplaene: function() {
                kreda.storage.dieseStunde.abschnittsplaene = [];
                var c = new QDBQuery(kreda.storage.idb);
                c.onFinish(function(result){
                    kreda.storage.dieseStunde.abschnittsplaene = kreda.storage.dieseStunde.sortiereAbschnittsplaene(result);
                    kreda.event.callevent('abschnittsplaene-geladen');
                });
                c.get("abschnittsplanung", {id: kreda.storage.dieseStunde.plan.abschnittsplaene});
            },
            ladeAbschnitte: function() {
                kreda.storage.dieseStunde.abschnitte = [];
                // wenn ein Abschnitt mehrmals vorkommen sollte, dann soll er trotzdem nur einmal geladen werden:
                var abschnittezuladen = [];
                for(var abschnittindex in kreda.storage.dieseStunde.abschnittsplaene){
                    if(abschnittezuladen.indexOf(kreda.storage.dieseStunde.abschnittsplaene[abschnittindex].abschnitt) == -1)
                        if(kreda.storage.dieseStunde.abschnittsplaene[abschnittindex].abschnitt != 0)  // Sonderfall Einmalabschnitt
                            abschnittezuladen[abschnittezuladen.length] = kreda.storage.dieseStunde.abschnittsplaene[abschnittindex].abschnitt;
                }
                var c = new QDBQuery(kreda.storage.idb);
                c.onFinish(function(result){
                    kreda.storage.dieseStunde.abschnitte = result;
                    kreda.event.callevent('abschnitte-geladen');
                });
                c.get("abschnitt", {id: abschnittezuladen}, "id");
            },
            ladeFachklasse: function() {
                var handler = kreda.storage.idb.transaction('fachklasse', 'readonly').objectStore('fachklasse').get(kreda.storage.dieseStunde.plan.fachklasse);
                handler.onsuccess = function(e){
                    kreda.storage.dieseStunde.fachklasse = e.target.result;
                    if(e.target.result != null)
                        kreda.event.callevent('fachklasse-geladen');
                    else
                        kreda.event.callevent('fachklasse-nicht-geladen');
                };
                handler.onerror = function(e){
                    kreda.event.callevent('fachklasse-nicht-geladen');
                };
            },
            ladeHausaufgaben: function() {
                var q = new QDBQuery(kreda.storage.idb);
                q.onFinish(function() {
                    kreda.event.callevent('hausaufgaben-geladen');
                });
                q.get("hausaufgabe", {aufgegeben_am: Date.now(), kontrolliert: false});
                //var handler = kreda.storage.idb.transaction('hausaufgabe', 'readonly').objectStore('hausaufgabe').openCursor();
                //kreda.storage.dieseStunde.hausaufgaben = [];
                //handler.onsuccess = function(e) {
                //    var cursor = e.target.result;
                //    if(cursor){
                //        /** @type {kreda.storage.store.hausaufgabe} */
                //        var value = cursor.value;
                //        //if(cursor.value.plan == kreda.storage.dieseStunde.plan.id)
                //        //    kreda.storage.dieseStunde.hausaufgaben[kreda.storage.dieseStunde.hausaufgaben.length] = cursor.value;
                //        if(value.aufgegeben_am < Date.now() && value.kontrolliert == false)
                //            kreda.storage.dieseStunde.hausaufgaben[kreda.storage.dieseStunde.hausaufgaben.length] = value;
                //        cursor.continue();
                //    } else {
                //        kreda.event.callevent('hausaufgaben-geladen');
                //    }
                //};
                //handler.onerror = function() {
                //    kreda.event.callevent('hausaufgaben-nicht-geladen');
                //};
            },
            ladeSchueler: function() {
                var c = new QDBQuery(kreda.storage.idb);
                c.onFinish(function(result){
                    kreda.storage.dieseStunde.schueler = result;
                    kreda.event.callevent('schueler-geladen');
                });
                c.get("schueler", {id: kreda.storage.dieseStunde.fachklasse.schueler}, "id");
            },
            ladeKlasse: function() {
                var handler = kreda.storage.idb.transaction('klasse', 'readonly').objectStore('klasse').get(kreda.storage.dieseStunde.fachklasse.klasse);
                handler.onsuccess = function(e){
                    kreda.storage.dieseStunde.klasse = e.target.result;
                    if(e.target.result != null)
                        kreda.event.callevent('klasse-geladen');
                    else
                        kreda.event.callevent('klasse-nicht-geladen');
                };
                handler.onerror = function(e){
                    kreda.event.callevent('klasse-nicht-geladen');
                };
            },
            ladeKlasseSitzplan: function() {
                var handler = kreda.storage.idb.transaction('sitzplan_klasse', 'readonly').objectStore('sitzplan_klasse').get(kreda.storage.dieseStunde.fachklasse.sitzplan_klasse);
                kreda.storage.dieseStunde.sitzplan_klasse = null;
                handler.onsuccess = function(e) {
                    if(e.target.result != null){
                        kreda.storage.dieseStunde.sitzplan_klasse = e.target.result;
                        kreda.event.callevent("sitzplan_klasse-geladen");
                    }
                    else
                        kreda.event.callevent("sitzplan_klasse-nicht-geladen");
                };
                handler.onerror = function(e) {
                    kreda.event.callevent("sitzplan_klasse-nicht-geladen");
                }
            },
            ladeSitzplan: function() {
                var handler = kreda.storage.idb.transaction('sitzplan', 'readonly').objectStore('sitzplan').get(parseInt(kreda.storage.dieseStunde.sitzplan_klasse.sitzplan));
                kreda.storage.dieseStunde.sitzplan = null;
                handler.onsuccess = function(e) {
                    kreda.storage.dieseStunde.sitzplan = e.target.result;
                    if(e.target.result)
                        kreda.event.callevent('sitzplan-geladen');
                    else
                        kreda.event.callevent('sitzplan-nicht-geladen');
                };
                handler.onerror = function(e) {
                    kreda.event.callevent('sitzplan-nicht-geladen');
                }
            },
            ladeSitzplaetze: function() {
                var c = new QDBQuery(kreda.storage.idb);
                c.onFinish(function(result) {
                    kreda.storage.dieseStunde.sitzplaetze = result;
                    kreda.event.callevent('sitzplaetze-geladen');
                });
                c.get("sitzplan_platz", {sitzplan_klasse: kreda.storage.dieseStunde.sitzplan_klasse.id}, "schueler");
            },
            ladeSitzplanHTML: function() {
                var handler = kreda.storage.idb.transaction("content").objectStore("content").get("sitzplan-" + kreda.storage.dieseStunde.sitzplan.id);
                /** @param e {Event} */
                handler.onsuccess = function(e){
                    if (e.target.result){
                        kreda.storage.dieseStunde.sitzplan_html = e.target.result.value;
                        kreda.event.callevent('sitzplan-html-geladen');
                    } else {
                        kreda.storage.dieseStunde.sitzplan_html = "";
                        kreda.event.callevent('sitzplan-html-nicht-geladen');
                    }
                };
                handler.onerror = function(){
                    kreda.storage.dieseStunde.sitzplan_html = "";
                    kreda.event.callevent('sitzplan-html-nicht-geladen');
                };
            },
            ladeFehlstunden: function() {
                var c = new QDBQuery(kreda.storage.idb);
                c.onFinish(function(result){
                    kreda.storage.dieseStunde.fehlstunden = result;
                    kreda.event.callevent("fehlstunden-geladen");
                });
                c.get("schueler_fehlt", {stunde: kreda.storage.dieseStunde.plan.id}, "schueler");
            },
            loader: function() {
                if(kreda.storage.dieseStunde.autoload)
                    setTimeout(kreda.storage.dieseStunde.ladePlan, 10000);
            },
            /**
             * sortiert die Abschnittspläne nach ihrer Position
             * @param plaene {Array.<kreda.storage.store.plan>}
             * @returns {Array.<kreda.storage.store.plan>}
             */
            sortiereAbschnittsplaene: function(plaene) {
                for(var a in plaene) {
                    var smallest = a;
                    for(var b = a; b < plaene.length; b++)
                        if(plaene[smallest].position > plaene[b].position)
                            smallest = b;
                    if(smallest != a){
                        var temp = plaene[a];
                        plaene[a] = plaene[smallest];
                        plaene[smallest] = temp;
                    }
                }
                return plaene
            }
        },
        /** @namespace */
        menu: {
            /** @type {Array.<kreda.storage.store.fachklasse>} */
            fachklasseEntries: [],
            /** @type {Array.<kreda.storage.store.plan>} */
            stundenEntries: [],
            /**
             * ladeStunden laed die Stunden, die an dem Schultag anliegen
             */
            ladeStunden: function() {
                kreda.storage.menu.stundenEntries = [];
                var jetzt = new Date();
                if(kreda.cfg.debug){
                    var von = 0;
                    var bis = 9007199254740992; // max int
                } else {
                    var von = new Date(jetzt.getYear() + 1900, jetzt.getMonth(), jetzt.getDate()).getTime(); // heute
                    var bis = new Date(jetzt.getYear() + 1900, jetzt.getMonth(), jetzt.getDate(), 23+24, 59, 59).getTime();
                }
                var handler = kreda.storage.idb.transaction('plan', 'readonly').objectStore('plan').openCursor();
                handler.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if(cursor){
                        if(cursor.value.datum > von && cursor.value.datum < bis){
                            kreda.storage.menu.stundenEntries[kreda.storage.menu.stundenEntries.length] = cursor.value;
                        }
                        cursor.continue();
                    }
                    else {
                        // zum schluss die Stunden sortieren:
                        kreda.storage.menu.stundenEntries = kreda.storage.menu.sortiereStunden(kreda.storage.menu.stundenEntries);
                        kreda.event.callevent("menu-stunden-geladen");
                    }

                };
                handler.onerror = function() {
                    kreda.event.callevent("menu-stunden-nicht-geladen");
                }
            },
            ladeFachklassen: function() {
                var handler = kreda.storage.idb.transaction('fachklasse', 'readonly').objectStore('fachklasse').openCursor();
                kreda.storage.menu.fachklasseEntries = [];
                handler.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if(cursor){
                        for(var i in kreda.storage.menu.stundenEntries){
                            if(kreda.storage.menu.stundenEntries[i].fachklasse == cursor.value.id) {
                                kreda.storage.menu.fachklasseEntries[cursor.value.id] = cursor.value;
                                break;
                            }
                        }
                        cursor.continue();
                    }
                    else
                        kreda.event.callevent("menu-fachklassen-geladen");
                };
                handler.onerror = function(event) {
                    kreda.event.callevent("menu-fachklassen-nicht-geladen");
                };
            },
            sortiereStunden: function(stunden) {
                for(var a = 0; a < stunden.length; a++){
                    var smallest = a;
                    var b = 0;
                    for(b = a + 1; b < stunden.length; b++){
                        if(stunden[smallest].datum > stunden[b].datum)
                            smallest = b;
                    }
                    if(smallest < stunden.length){
                        var temp = stunden[smallest];
                        stunden[smallest] = stunden[a];
                        stunden[a] = temp;
                    }
                }
                return stunden;
            }
        },
        /** @namespace */
        store: {
            /** @class */
            schueler: function() {
                this.id = null;
                this.maennlich = false;
                this.vorname = "";
                this.name = "";
                this.username = "";
                this.geburtstag = "";
                this.geburtsort = "";
                this.notfall = "";
                this.email = "";
                this.ort = "";
                this.krankenkasse = "";
                this.klasse = "";
                this.bemerkungen = "";
                this.aktiv = false;
                this.position = null;
                this.strasse = "";
                this.telefon = "";
            },
            /** @class */
            content: function() {
                this.id = null;
                this.content = "";
            },
            /** @class */
            sitzplan: function (){
                this.id = null;
                this.name = null;
                this.aktiv = null;
                this.user = null;
            },
            /** @class */
            sitzplan_klasse: function () {
                this.id = null;
                this.name = null;
                this.klasse = null;
                this.seit = null;
                this.sitzplan = null;
            },
            /** @class */
            sitzplan_platz: function () {
                this.id = null;
                this.sitzplan_klasse = null;
                this.sitzplatz_id = null;
                this.schueler = null;
            },
            /** @class */
            klasse: function () {
                this.id = null;
                this.einschuljahr = null;
                this.endung = null;
                this.schule = null;
                this.schulart = null;
                this.fehlzeiten_erledigt_bis = null;
            },
            /** @class */
            fachklasse: function () {
                this.id = null;
                this.klasse = null;
                this.fach = null;
                this.farbe = null;
                this.name = null;
                this.bewertungstabelle = null;
                this.sitzplan_klasse = null;
                this.schueler = null;
            },
            /** @class */
            abschnittsplanung: function () {
                this.id = null;
                this.abschnitt = null;
                this.plan = null;
                this.minuten = null;
                this.position = null;
                this.bemerkung = null;
            },
            /** @class */
            abschnitt: function () {
                this.id = null;
                this.value = null;
                this.nachbereitung = null;
                this.minuten = null;
                this.hefter = null;
            },
            /** @class */
            plan: function() {
                /** @type {?number} */
                this.id = null;
                /** @type {?number} */
                this.datum = null;
                /** @type {?number} */
                this.schuljahr = null;
                /** @type {?number} */
                this.fachklasse = null;
                /** @type {?number} */
                this.nachbereitung = null;
                /** @type {?string} */
                this.zusatzziele = null;
                /** @type {?boolean} */
                this.gedruckt = null;
                /** @type {?string} */
                this.material_da = null;
                /** @type {?string} */
                this.ausfallgrund = null;
                /** @type {?string} */
                this.notizen = null;
                /** @type {?boolean} */
                this.vorbereitet = null;
                /** @type {?string} */
                this.bemerkung = null;
                /** @type {?number} */
                this.ustd = null;
                /** @type {?string} */
                this.alternativtitel = null;
                /** @type {?string} */
                this.struktur = null;
                /** @depracted */
                this.ueberschriftsbeginn = null;
                /** @type {?boolean} */
                this.ohne_pause = null;
                /** @type {Array.<number>} */
                this.abschnittsplaene = null;
            },
            /** @class */
            hausaufgabe: function () {
                /** @type {?number} */
                this.id = null;
                /** @type {?string} */
                this.ziel = null;
                /** @type {?string} */
                this.bemerkung = null;
                /** @type {?number} */
                this.abgabedatum = null;
                /** @type {?boolean} */
                this.kontrolliert = null;
                /** @type {?number} */
                this.fachklasse = null;
                /** @type {?number} */
                this.aufgegeben_am = null;
                /** @type {?number} */
                this.plan = null;
                /** @type {?boolean} */
                this.mitzaehlen = null;
                /** @type {?string} */
                this.value = null;
            },
            /**
             * @class
             */
            hausaufgabe_vergessen: function () {
                this.hausaufgabe = null;
                this.schueler = null;
                this.anzahl = null;
                this.bemerkung = null;
                this.erledigt = null;
            },
            /** @class */
            pictures: function() {
                this.id = null;
                this.image = null;
                this.imgtype = null;
            },
            /**
             * @class
             */
            schueler_fehlt: function() {
                /**
                 * primary
                 * @type {?number}
                 */
                this.id = null;
                /**
                 * Schueler ID
                 * @type {?number}
                 */
                this.schueler = null;
                /**
                 * Plan ID
                 * @type {?number}
                 */
                this.stunde = null;
                /**
                 *
                 * @type {?boolean}
                 */
                this.entschuldigt = null;
            },
            changes: {
                NEU: 0,
                CHANGED: 1,
                DELETED: 2,
                addQuiet: function(store, primary, state, counter) {
                    kreda.log(store + " " + primary + " CHANGED; state: " + state);
                    kreda.storage.insert('changes', {store: store, primary: primary, state: state}, null, counter);
                },
                saveQuiet: function(store, primary, state, counter) {
                    kreda.log(store + " " + primary + " CHANGED; state: " + state);
                    counter = counter || new QDBCounter();
                    counter.add();
                    var handler = kreda.storage.idb.transaction('changes', 'readwrite').objectStore('changes').openCursor();
                    handler.onsuccess = function (e) {
                        var cursor = e.target.result;
                        if(cursor) {
                            if(cursor.value.store == store && cursor.value.primary == primary) {
                                if(cursor.value.state == kreda.storage.store.changes.NEU){
                                    if(state == kreda.storage.store.changes.DELETED){
                                        cursor.delete(cursor.value);
                                        counter.finishedOperation();
                                    }
                                    else
                                        counter.finishedOperation();
                                    // else: wenn geändert ist es egal;
                                }
                                else {
                                    cursor.value.state = state;
                                    cursor.update(cursor.value);
                                    counter.finishedOperation();
                                }
                            }
                            else
                                cursor.continue();
                        }
                        else {
                            kreda.storage.store.changes.addQuiet(store, primary, state, counter);
                            counter.finishedOperation();
                        }
                    }
                },
                /**
                 *
                 * @param {String} store
                 * @param {Array} ids
                 * @param {Number} state
                 * @param {QDBCounter} counter
                 */
                saveListQuiet: function(store, ids, state, counter) {
                    counter.add();
                    for(var i = 0; i < ids.length; i++)
                        kreda.storage.store.changes.saveQuiet(store, ids[i], state, counter);
                    counter.finishedOperation();
                }
            }
        }
    },
    /** @namespace */
    transfer: {
        HTTPRequest: function () {
            if (window.XMLHttpRequest){
                return new XMLHttpRequest();
            }
            else {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        },
        loadContent: function (url) {
            var xmlhttp = kreda.transfer.HTTPRequest();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 0)) {  // ==0 fuer chrome offline
                    try{
                        var assoc = JSON.parse(xmlhttp.responseText);
                    }
                    catch (e) {
                        kreda.ui.raiseError(e.message);
                    }

                    var trans = new QDBCounter();
                    trans.onFinish(function(_this){
                        kreda.event.callevent("import-complete");
                    });
                    kreda.ui.progressPopup.show("Daten werden gespeichert...", trans);
                    trans.add();            // verhindern, dass zwischendurch finish ausgelöst wird
                    kreda.storage.insertAssoc(assoc, trans);
                    trans.finishedOperation();
                    // kreda.transfer.loadImages(images);
                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        },
        /**
         *
         * @param {QDBCounter} [c]
         */
        upload: function(c) {
            var counter = new QDBCounter(c);
            var daten = {created: {}, removed: {}, changed: {}};
            kreda.ui.progressPopup.show("Daten werden hochgeladen", counter);
            counter.add();
            counter.add(); // wird im $.ajax.done beendet
            var datensammelprozess = new QDBCounter(counter);
            datensammelprozess.onFinish(function() {
                $.ajax({
                    url: "sync.php",
                    method: "POST",
                    data: daten,
                    async: true
                }).done(function(data) {
                        console.log(data);
                    }).always(function() {
                        counter.finishedOperation();
                    });
            });
            datenSammeln(datensammelprozess);

            counter.finishedOperation();
            /**
             * @param {QDBCounter} datensammelprozess
             */
            function datenSammeln(datensammelprozess) {
                datensammelprozess.add();
                ladeNeueDaten();
                ladeModifizierteDaten();
                listRemoved();
                datensammelprozess.finishedOperation();
                function ladeNeueDaten() {
                    var neuref = new QDBQuery(kreda.storage.idb, datensammelprozess);
                    var dataLoadCounter = new QDBCounter(datensammelprozess);
                    dataLoadCounter.add();
                    neuref.onFinish(function() {
                        for(var store in neuref.result) {
                            var k = [];
                            for(var i = 0; i < neuref.result[store].length; i++) {
                                k.push(neuref.result[store][i].primary);
                            }
                            loadNewData(store, k);
                        }
                        function loadNewData(storename, keys) {
                            dataLoadCounter.add();
                            var neuausstore = new QDBQuery(kreda.storage.idb);
                            neuausstore.onFinish(function() {
                                daten.created[storename] = neuausstore.result;
                                dataLoadCounter.finishedOperation();
                            });
                            var where = {};
                            where[kreda.storage.idb.transaction(storename).objectStore(storename).keyPath] = keys;
                            neuausstore.get(storename, where);
                        }
                        dataLoadCounter.finishedOperation();
                    });
                    neuref.get("changes", {state: kreda.storage.store.changes.NEU}, {indexby: "store", stack: true});
                }
                function ladeModifizierteDaten() {
                    var neuref = new QDBQuery(kreda.storage.idb, datensammelprozess);
                    var dataLoadCounter = new QDBCounter(datensammelprozess);
                    dataLoadCounter.add();
                    neuref.onFinish(function() {
                        for(var store in neuref.result) {
                            var k = [];
                            for(var i = 0; i < neuref.result[store].length; i++) {
                                k.push(neuref.result[store][i].primary);
                            }
                            loadNewData(store, k);
                        }
                        function loadNewData(storename, keys) {
                            dataLoadCounter.add();
                            var neuausstore = new QDBQuery(kreda.storage.idb);
                            neuausstore.onFinish(function() {
                                daten.changed[storename] = neuausstore.result;
                                dataLoadCounter.finishedOperation();
                            });
                            var where = {};
                            where[kreda.storage.idb.transaction(storename).objectStore(storename).keyPath] = keys;
                            neuausstore.get(storename, where);
                        }
                        dataLoadCounter.finishedOperation();
                    });
                    neuref.get("changes", {state: kreda.storage.store.changes.CHANGED}, {indexby: "store", stack: true});
                }
                function listRemoved() {
                    datensammelprozess.add();
                    var changequery = new QDBQuery(kreda.storage.idb);
                    changequery.onFinish(function() {
                        daten.removed = changequery.result;
                        datensammelprozess.finishedOperation();
                    });
                    changequery.get("changes", {state: kreda.storage.store.changes.DELETED});
                }
            }
        }
    },
    log: function(msg){
        if(kreda.cfg.debug)
            console.log("Kreda: " + msg);
    },
    /** @namespace */
    event: {
        events: {},
        callevent: function(event) {
            kreda.log("call event: " + event);
            if(kreda.event.events[event] != null){
                for(var i in kreda.event.events[event])
                    setTimeout(kreda.event.events[event][i], 5);
            }
        },
        hook: function(event, func) {
            if(kreda.event.events[event] == null){
                kreda.event.events[event] = [ func ];
                return 0;
            }
            else {
                kreda.event.events[event].push(func);
                return kreda.event.events[event].indexOf(func);
            }
        },
        removeHook: function(event, func) {
            kreda.event.events[event].splice(kreda.event.events[event].indexOf(func));
        },
        removeHookByID: function(event, id) {
            kreda.event.events[event].splice(id);
        }
    }
};
