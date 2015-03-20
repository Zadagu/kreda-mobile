/*
 Kreda-Mobile Webapplication for Smartphones and Tablets to access Kreda
 Copyright (C) 2014  Kilian Ulrichsohn
 This Source was puplished under the Kreda-Mobile License.
 You should find a version of the license in a file called "LICENSE".
 */

$(document).ready(function () {
    kreda.ui.updateView();
    kreda.storage.open.openDB(2);

    // Events initialisieren:
    kreda.event.hook('open-database',               function() {
        kreda.ui.loadContent();
        kreda.ui.setTitle();
    });
    // Menu Zyklus:
    kreda.event.hook('open-database',               kreda.storage.menu.ladeStunden);
    kreda.event.hook('menu-stunden-geladen',        kreda.storage.menu.ladeFachklassen);
    kreda.event.hook('menu-fachklassen-geladen',    function() {
        kreda.ui.menu.displayStunden();
        kreda.ui.menu.displayKlassen();
    });

    // Stunden Zyklus:
    kreda.event.hook('open-database',               kreda.storage.dieseStunde.activateLoader);
    kreda.event.hook('plan-geladen',                function () {
        kreda.storage.dieseStunde.ladeAbschnittsplaene();
        kreda.storage.dieseStunde.ladeFachklasse();
        kreda.storage.dieseStunde.ladeHausaufgaben();
        kreda.storage.dieseStunde.ladeFehlstunden();
    });
    kreda.event.hook('fachklasse-geladen',          function () {
        kreda.ui.setTitle();
        kreda.storage.dieseStunde.ladeKlasse();
    });
    kreda.event.hook('klasse-geladen',              kreda.storage.dieseStunde.ladeSchueler);
    kreda.event.hook('schueler-geladen',            kreda.storage.dieseStunde.ladeKlasseSitzplan);
    kreda.event.hook('sitzplan_klasse-geladen',     kreda.storage.dieseStunde.ladeSitzplan);
    kreda.event.hook('sitzplan-geladen',            kreda.storage.dieseStunde.ladeSitzplaetze);
    kreda.event.hook('sitzplaetze-geladen',         kreda.storage.dieseStunde.ladeSitzplanHTML);
    kreda.event.hook('abschnittsplaene-geladen',    kreda.storage.dieseStunde.ladeAbschnitte);
    kreda.event.hook('abschnitte-geladen',          function() {
        kreda.ui.dieseStunde.displayPlan();
        kreda.ui.loadImages();
        kreda.ui.dieseStunde.updateProgressbar();
        kreda.ui.setTitle();
        try{
            AMprocessNode(document.getElementById('unterrichtsabschnitte'));
        } catch (e){}
    });
    kreda.event.hook('hausaufgaben-geladen',        kreda.ui.dieseStunde.displayHausaufgaben);

    kreda.event.hook('import-complete',             function() {
        kreda.ui.loadContent();
        kreda.storage.menu.ladeStunden();
    });
    kreda.event.hook('popup-sitzplan-closed',       function() {kreda.ui.sitzplan.handleclosed()});  // function() {} Darf nicht weggelassen werden, da handleclosed überschrieben wird und die überschriebene Funktion soll ausgeführt werden
    // start tick for progressbar
    kreda.ui.dieseStunde.progressTick();
});

$(window).resize(function () {
    kreda.ui.updateView();
});

function defaultContent()
{
    /*
    * Die folgenden Daten wurden alle zufällig generiert
    * Ähnlichkeiten mit real existierenden Personen sind daher zufällig und nicht beabsichtigt
     */
    // Content
    kreda.storage.store.content.insertQuiet("hello-world", "<b>Hallo Welt!</b>");
    kreda.storage.store.content.insertQuiet("sitzplan-0", "<table><tbody><tr class=\"kreda-sitzreihe\"><td class=\"kreda-sitz-platz\" id=\"p-1\" data-pid=\"1\"></td><td class=\"kreda-sitz-platz\" id=\"p-2\" data-pid=\"2\"></td><td class=\"kreda-sitz-platz\" id=\"p-3\" data-pid=\"3\"></td><td class=\"kreda-sitz-platz\" id=\"p-4\" data-pid=\"4\"></td><td class=\"kreda-sitz-platz\" id=\"p-5\" data-pid=\"5\"></td><td class=\"kreda-sitz-platz\" id=\"p-6\" data-pid=\"6\"></td></tr><tr class=\"kreda-sitzreihe\"><td class=\"kreda-sitz-platz\" id=\"p-7\"  data-pid=\"7\"></td><td class=\"kreda-sitz-platz\" id=\"p-8\"  data-pid=\"8\"></td><td class=\"kreda-sitz-platz\" id=\"p-9\"  data-pid=\"9\"></td><td class=\"kreda-sitz-platz\" id=\"p-10\" data-pid=\"10\"></td><td class=\"kreda-sitz-platz\" id=\"p-11\" data-pid=\"11\"></td><td class=\"kreda-sitz-platz\" id=\"p-12\" data-pid=\"12\"></td></tr></tbody></table>");
    kreda.storage.store.content.insertQuiet("stundenplan", '<div style="height: 300px; width: 400px; background-color: #005599"></div>');

    // Schueler
    kreda.storage.store.schueler.insertObjQuiet({id: 50, name : "Grunwald", vorname: "Nathaniel",    geburtstag: new Date(2003, 10, 14).getTime(), strasse: "Milly Straße", ort: "Berlin", klasse: 0, email: "Nathaniel.Grunwald@example.org", telefon: "4618288", bemerkungen: "", maennlich: true, aktiv: true, position: 0, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 51, name : "Schädlich", vorname: "Orel",        geburtstag: new Date(1994, 11, 5).getTime(), strasse: "Foss Straße", ort: "Berlin", klasse: 0, email: "Orel.Schädlich@example.org", telefon: "5753564", bemerkungen: "", maennlich: false, aktiv: true, position: 1, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 52, name : "Melcher", vorname: "Dorian",        geburtstag: new Date(1988, 5, 26).getTime(), strasse: "Hiram Straße", ort: "Berlin", klasse: 0, email: "Dorian.Melcher@example.org", telefon: "9201307", bemerkungen: "", maennlich: false, aktiv: true, position: 2, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 53, name : "Moosmann", vorname: "Artair",       geburtstag: new Date(1954, 3, 1).getTime(), strasse: "Emma Straße", ort: "Berlin", klasse: 0, email: "Artair.Moosmann@example.org", telefon: "6935522", bemerkungen: "", maennlich: true, aktiv: true, position: 3, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 54, name : "Siepmann", vorname: "Carmella",     geburtstag: new Date(1973, 9, 7).getTime(), strasse: "Morgun Straße", ort: "Berlin", klasse: 0, email: "Carmella.Siepmann@example.org", telefon: "9455189", bemerkungen: "", maennlich: false, aktiv: true, position: 4, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 55, name : "Scheffler", vorname: "Basil",       geburtstag: new Date(1921, 9, 22).getTime(), strasse: "Elizabeth Straße", ort: "Berlin", klasse: 0, email: "Basil.Scheffler@example.org", telefon: "688580", bemerkungen: "", maennlich: true, aktiv: true, position: 5, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 56, name : "Pick", vorname: "Essie",            geburtstag: new Date(1980, 3, 27).getTime(), strasse: "Bucky Straße", ort: "Berlin", klasse: 0, email: "Essie.Pick@example.org", telefon: "5949245", bemerkungen: "", maennlich: false, aktiv: true, position: 6, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 57, name : "Angerer", vorname: "Marcello",      geburtstag: new Date(2004, 7, 22).getTime(), strasse: "Waly Straße", ort: "Berlin", klasse: 0, email: "Marcello.Angerer@example.org", telefon: "1782346", bemerkungen: "", maennlich: true, aktiv: true, position: 7, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 58, name : "Runge", vorname: "Kale",            geburtstag: new Date(1918, 11, 17).getTime(), strasse: "Cosetta Straße", ort: "Berlin", klasse: 0, email: "Kale.Runge@example.org", telefon: "2799297", bemerkungen: "", maennlich: true, aktiv: true, position: 8, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 59, name : "Ammon", vorname: "Laverna",         geburtstag: new Date(2011, 1, 28).getTime(), strasse: "Luther Straße", ort: "Berlin", klasse: 0, email: "Laverna.Ammon@example.org", telefon: "1476677", bemerkungen: "", maennlich: false, aktiv: true, position: 9, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 60, name : "Kübler", vorname: "Philippine",     geburtstag: new Date(1905, 8, 1).getTime(), strasse: "Cristobal Straße", ort: "Berlin", klasse: 0, email: "Philippine.Kübler@example.org", telefon: "1850324", bemerkungen: "", maennlich: false, aktiv: true, position: 10, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 61, name : "Lay", vorname: "Mendel",            geburtstag: new Date(2012, 6, 24).getTime(), strasse: "Teirtza Straße", ort: "Berlin", klasse: 0, email: "Mendel.Lay@example.org", telefon: "4390257", bemerkungen: "", maennlich: true, aktiv: true, position: 11, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 62, name : "Krull", vorname: "Isabel",          geburtstag: new Date(1926, 7, 3).getTime(), strasse: "Huey Straße", ort: "Berlin", klasse: 0, email: "Isabel.Krull@example.org", telefon: "7782890", bemerkungen: "", maennlich: false, aktiv: true, position: 12, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 63, name : "Spitz", vorname: "Burtie",          geburtstag: new Date(2011, 3, 5).getTime(), strasse: "Anastasie Straße", ort: "Berlin", klasse: 0, email: "Burtie.Spitz@example.org", telefon: "4718746", bemerkungen: "", maennlich: true, aktiv: true, position: 13, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 64, name : "Dörner", vorname: "Margit",         geburtstag: new Date(1980, 7, 20).getTime(), strasse: "Brnaby Straße", ort: "Berlin", klasse: 0, email: "Margit.Dörner@example.org", telefon: "2629558", bemerkungen: "", maennlich: false, aktiv: true, position: 14, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 65, name : "Heldt", vorname: "Barret",          geburtstag: new Date(1950, 3, 18).getTime(), strasse: "Heath Straße", ort: "Berlin", klasse: 0, email: "Barret.Heldt@example.org", telefon: "7908005", bemerkungen: "", maennlich: true, aktiv: true, position: 15, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 66, name : "Theil", vorname: "Fairfax",         geburtstag: new Date(1904, 2, 22).getTime(), strasse: "Gwyn Straße", ort: "Berlin", klasse: 0, email: "Fairfax.Theil@example.org", telefon: "4224767", bemerkungen: "", maennlich: true, aktiv: true, position: 16, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 67, name : "Prinz", vorname: "Jecho",           geburtstag: new Date(1917, 6, 2).getTime(), strasse: "Emmalynne Straße", ort: "Berlin", klasse: 0, email: "Jecho.Prinz@example.org", telefon: "2259844", bemerkungen: "", maennlich: true, aktiv: true, position: 17, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 68, name : "Steinhauser", vorname: "Barbabra",  geburtstag: new Date(1960, 9, 28).getTime(), strasse: "Nickolaus Straße", ort: "Berlin", klasse: 0, email: "Barbabra.Steinhauser@example.org", telefon: "5187885", bemerkungen: "", maennlich: false, aktiv: true, position: 18, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 69, name : "Stern", vorname: "Kathe",           geburtstag: new Date(1904, 11, 21).getTime(), strasse: "Preston Straße", ort: "Berlin", klasse: 0, email: "Kathe.Stern@example.org", telefon: "1138538", bemerkungen: "", maennlich: false, aktiv: true, position: 19, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 70, name : "Katz", vorname: "Niccolo",          geburtstag: new Date(1926, 12, 9).getTime(), strasse: "Marleah Straße", ort: "Berlin", klasse: 0, email: "Niccolo.Katz@example.org", telefon: "3784661", bemerkungen: "", maennlich: true, aktiv: true, position: 20, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 71, name : "Frese", vorname: "Meredithe",       geburtstag: new Date(1921, 5, 27).getTime(), strasse: "Shawn Straße", ort: "Berlin", klasse: 0, email: "Meredithe.Frese@example.org", telefon: "4137867", bemerkungen: "", maennlich: false, aktiv: true, position: 21, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 72, name : "Hild", vorname: "Amie",             geburtstag: new Date(1954, 7, 3).getTime(), strasse: "Vale Straße", ort: "Berlin", klasse: 0, email: "Amie.Hild@example.org", telefon: "3429235", bemerkungen: "", maennlich: false, aktiv: true, position: 22, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 73, name : "Dettmer", vorname: "Stefano",       geburtstag: new Date(1905, 10, 5).getTime(), strasse: "Mariska Straße", ort: "Berlin", klasse: 0, email: "Stefano.Dettmer@example.org", telefon: "5270290", bemerkungen: "", maennlich: true, aktiv: true, position: 23, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 74, name : "Stoffel", vorname: "Josefina",      geburtstag: new Date(1957, 6, 2).getTime(), strasse: "Hagan Straße", ort: "Berlin", klasse: 0, email: "Josefina.Stoffel@example.org", telefon: "9180236", bemerkungen: "", maennlich: false, aktiv: true, position: 24, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 75, name : "Radloff", vorname: "Janenna",       geburtstag: new Date(1950, 3, 8).getTime(), strasse: "Rikki Straße", ort: "Berlin", klasse: 0, email: "Janenna.Radloff@example.org", telefon: "3641371", bemerkungen: "", maennlich: false, aktiv: true, position: 25, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 76, name : "Hornig", vorname: "Nertie",         geburtstag: new Date(1991, 9, 21).getTime(), strasse: "Klement Straße", ort: "Berlin", klasse: 0, email: "Nertie.Hornig@example.org", telefon: "6911272", bemerkungen: "", maennlich: false, aktiv: true, position: 26, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});
    kreda.storage.store.schueler.insertObjQuiet({id: 77, name : "Neff", vorname: "Filippa",          geburtstag: new Date(1970, 10, 24).getTime(), strasse: "Izak Straße", ort: "Berlin", klasse: 0, email: "Filippa.Neff@example.org", telefon: "2298462", bemerkungen: "", maennlich: false, aktiv: true, position: 27, geburtsort: "München", krankenkasse: "Sparschwein", notfall: "", username: ""});

    // Klasse
    kreda.storage.store.klasse.insertQuiet(0, 2000, 'ABC', 0, 2, null);

    // Sitzplan_klasse
    kreda.storage.store.sitzplan_klasse.insertQuiet(0, "default", 0, new Date(2001, 7, 20).getTime(), 0);
    kreda.storage.store.sitzplan.insertQuiet(0, "Test123", true, 0);

    // Fachklasse
    kreda.storage.store.fachklasse.insertQuiet(0, 0, 0, "aabbcc", "Info Kurs", 0, 0, [50, 52, 54, 56, 72]);

    // Plan
    var heute = new Date();
    kreda.storage.store.plan.insertQuiet(0, new Date(heute.getUTCFullYear(), heute.getMonth(), heute.getUTCDate(), 13, 15, 0).getTime(), 2014, 0, 0, "Hallo", 0, 1, "", "", 1, "", 2, "", "", 23, 1, [0, 1, 2, 3]);
    kreda.storage.store.plan.insertQuiet(1, new Date(heute.getUTCFullYear(), heute.getMonth(), heute.getUTCDate(), 8, 30, 0).getTime(), 2014, 0, 0, "Hallo", 0, 1, "", "", 1, "", 2, "", "", 23, 1, [0, 1]);
    kreda.storage.store.plan.insertQuiet(2, new Date(heute.getUTCFullYear(), heute.getMonth(), heute.getUTCDate(), 22, 30, 0).getTime(), 2014, 0, 0, "Hallo", 0, 1, "", "", 1, "", 2, "", "", 23, 1, [0, 0, 1, 3, 2, 2]);
    kreda.storage.store.plan.insertQuiet(2347, new Date(heute.getUTCFullYear(), heute.getMonth(), heute.getUTCDate(), 10, 30, 0).getTime(), 2014, 0, 0, "", 0, 0, "", "", 1, "gibts nicht", 1, "", "", 23, 0, [1] );

    // Abschnittsplan
    kreda.storage.store.abschnittsplanung.insertQuiet(1, 3, 0, 10, 1, "zum zweiten");
    kreda.storage.store.abschnittsplanung.insertQuiet(0, 1, 0, 10, 0, "zum ersten");
    kreda.storage.store.abschnittsplanung.insertQuiet(2, 2, 0, 10, 2, "zum dritten");
    kreda.storage.store.abschnittsplanung.insertQuiet(3, 1, 0, 30, 3, "zum vierten");

    // Abschnitt
    kreda.storage.store.abschnitt.insertQuiet(3, "<b>Hallo Welt!</b><br><br><br><br>test1234<br>wfqe", "", 10, true);
    kreda.storage.store.abschnitt.insertQuiet(2, "<b>Bild:</b><br><img src='data/prod1.png' class='kreda-saved-image'>", "", 15, true);
    kreda.storage.store.abschnitt.insertQuiet(1, "<span class=\"ueberschrift\" onclick=\"this.className='ueberschrift_sel';\">4. Informationsbeschaffung</span><br /><span class=\"sonstiges\" onclick=\"this.className='sonstiges_sel';\">Informationen finden wir in Büchern, Zeitschriften (=Printmedien) oder im Internet (oder in Lernprogrammen) (=elektronische Medien).<br />   <table class=\"test_tabelle\" cellspacing=\"0\"><tr><td>  </td><td> <span style=\"font-weight: bold;\">Printmedien</span> </td><td> <span style=\"font-weight: bold;\">elektronische Medien</span> </td></tr><tr><td> <span style=\"font-weight: bold;\">Interaktivität</span> </td><td> keine </td><td> unbekannte Begriffe lassen sich meist ebenfalls erforschen </td></tr><tr><td> <span style=\"font-weight: bold;\">Erweiterbarkeit</span> </td><td> keine </td><td> zB bei Wikipedia kann jeder Informationen ergänzen </td></tr><tr><td> <span style=\"font-weight: bold;\">Wahrheitsgehalt</span> </td><td> gut (Verlage kontrollieren) </td><td> verschieden </td></tr><tr><td> <span style=\"font-weight: bold;\">Verfügbarkeit</span> </td><td> erst kaufen </td><td> lediglich Internetanschluss nötig </td></tr><tr><td> <span style=\"font-weight: bold;\">Aktualität</span> </td><td> vom Kaufdatum abhängig </td><td> ständig neuste Version online </td></tr></table></span><br /> <b></b>", "Schüler selbst überlegen lassen", 25, 1);

    kreda.storage.store.pictures.insertQuiet("data/prod1.png", "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");

    kreda.storage.store.hausaufgabe.insertQuiet(0, "Lb 404/pi+e+i", "", new Date(heute.getUTCDate(), 48, 30, 0).getTime(), false, 0, true);

}

