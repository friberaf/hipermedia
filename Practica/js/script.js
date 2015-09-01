
/*

  Codi que permetrà ajustar el menú de manera que sigui responsive

*/
(function($) {
  $.fn.menumaker = function(options) {
      
      var cssmenu = $(this), settings = $.extend({
        title: "Music Recommender",
        format: "dropdown",
        sticky: false
      }, options);

      return this.each(function() {
        cssmenu.prepend('<img id="logo" src="imagenes/logo.png"><div id="menu-button">' + settings.title + '</div>');
        $(this).find("#menu-button").on('click', function(){
          $(this).toggleClass('menu-opened');
          var mainmenu = $(this).next('ul');
          if (mainmenu.hasClass('open')) { 
            mainmenu.hide().removeClass('open');
          }
          else {
            mainmenu.show().addClass('open');
            if (settings.format === "dropdown") {
              mainmenu.find('ul').show();
            }
          }
        });

        cssmenu.find('li ul').parent().addClass('has-sub');

        multiTg = function() {
          cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
          cssmenu.find('.submenu-button').on('click', function() {
            $(this).toggleClass('submenu-opened');
            if ($(this).siblings('ul').hasClass('open')) {
              $(this).siblings('ul').removeClass('open').hide();
            }
            else {
              $(this).siblings('ul').addClass('open').show();
            }
          });
        };

        if (settings.format === 'multitoggle') multiTg();
        else cssmenu.addClass('dropdown');

        if (settings.sticky === true) cssmenu.css('position', 'fixed');

        resizeFix = function() {
          if ($( window ).width() > 768) {
            cssmenu.find('ul').show();
            if ($("#removable")[0]){
            } else {
                $("#logo").remove();
                cssmenu.prepend('<img id="logo" src="imagenes/logo.png"><div id="removable">Music Recommender</div>');
            }
          }

          if ($(window).width() <= 768) {
            cssmenu.find('ul').hide().removeClass('open');
            $("#removable").remove();
          }
        };
        resizeFix();
        return $(window).on('resize', resizeFix);

      });
  };
})(jQuery);

(function($){
    $(document).ready(function(){

    $("#cssmenu").menumaker({
       title: "Music Recommender",
       format: "multitoggle"
    });

  });
})(jQuery);


/******************************************************************************************

                      Objecte que servirà per poder escoltar les 
                      diferents cançons 

******************************************************************************************/

var Player = {
  play : function (name, artist) {
    var button = document.createElement("button");
    button.id = "playlist_button";

    var url_track = AJAX.request('https://api.spotify.com/v1/search?q=track:'+name+'%20artist:'+artist+'&type=track');
    
    if (document.getElementById("play_song") != null)
      document.getElementById("play_song").parentNode.removeChild(document.getElementById("play_song"));

    //Es crearà una zona de reproducció
    var div = document.createElement("div");
    div.id = "play_song";

    var i = document.createElement("i");
    //Canviem el + d'afegir la cançó per un -, per si es vol eliminar de la llista de preferits
    if ( Data.checkPreviousSongs(name) ) {
      i.setAttribute("class", "fa fa-minus-circle");
      //En cas de que ens vulguin apretar el - s'haurà d'eliminar la cançó de la llista
      button.setAttribute("onclick", 'javascript:Data.removeSong("'+name+'", "'+url_track.tracks.items[0].artists[0].name+'", "'+url_track.tracks.items[0].album.name+'","'+url_track.tracks.items[0].preview_url+'","'+url_track.tracks.items[0].album.images[0].url+'")');
    } 
    else {
      i.setAttribute("class", "fa fa-plus-circle");
      button.setAttribute("onclick", 'javascript:Data.save("'+name+'", "'+url_track.tracks.items[0].artists[0].name+'", "'+url_track.tracks.items[0].album.name+'","'+url_track.tracks.items[0].preview_url+'","'+url_track.tracks.items[0].album.images[0].url+'")');
    }
    i.title = "Add to my playlist";

    //Creem un element audio i activem els diferents controls
    var audio = document.createElement("audio");
    audio.controls = true;
    audio.autoplay = true;

    var source = document.createElement("source");
    source.id = "source_song";
    source.src = url_track.tracks.items[0].preview_url;
    source.type = "audio/mpeg";

    audio.appendChild(source);
    
    var info = document.createElement("div");
    info.id = "info_song_play";
    //Es controlarà que spotify no pugui reproduir la cançó i per tant es mostrarà un missatge d'error
    if (url_track != "null")
      info.appendChild(document.createTextNode(name));
    else 
      info.appendChild(document.createTextNode("Unable to play"));

    div.appendChild(info);
    button.appendChild(i);
    div.appendChild(button);
    if (url_track != "null")
      div.appendChild(audio);

    document.body.appendChild(div);
  },
}
/******************************************************************************************

                        Simple object to manage the AJAX calls

******************************************************************************************/
var AJAX = {
  request: function(url){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    //Es retornen les dades en fomrat JSON
    return JSON.parse(xhr.responseText);
  }
}

/******************************************************************************************

                Objecte que servirà per guardar les cançons en una llista 
                de preferits
******************************************************************************************/
var Data = {
  myPlaylist : new Array(),

  checkPreviousSongs : function (name) {
    var algunCop = 0;
    for (i = 0; i < this.myPlaylist.length; i ++) {
      if (this.myPlaylist[i]["name"] == name) {
        //La cançó existeix
        algunCop = algunCop + 1;
      }
    }
    if (algunCop == 0) {
      return false;
    }
    else {
      return true;
    }
  },

  removeSong : function (songName, artist, album, preview , image) {
    //Canviem el -, pel + 
    document.getElementById("playlist_button").parentNode.removeChild(document.getElementById('playlist_button'));

    var button = document.createElement("button");
    button.id = "playlist_button";
    button.setAttribute("onclick", 'javascript:Data.save("'+songName+'", "'+artist+'", "'+album+'","'+preview+'","'+image+'")');

    var i = document.createElement("i");
    i.setAttribute("class", "fa fa-plus-circle");

    button.appendChild(i);

    document.getElementById("play_song").appendChild(button);

    //Eliminem l'element de la llista
    for (i = 0; i < this.myPlaylist.length; i ++) {
      if (this.myPlaylist[i]["name"] == songName) {
        this.myPlaylist.splice(i,1);
      }
    }
    //Refresquem la pàgina 
    if (document.getElementById("myPlaylist")) {
      MusicRecommender.playlist();
    }
  },

  save : function (songName, artist, album, preview , image) {
    //Comprovem que les cançons no estiguin duplicades
    if ( !Data.checkPreviousSongs(songName) ) {
      this.myPlaylist.push({ name: songName, artist: artist, album: album, preview_URL: preview, image: image });  
    }
    //Canviem el +, pel - 
    document.getElementById("playlist_button").parentNode.removeChild(document.getElementById('playlist_button'));

    var button = document.createElement("button");
    button.id = "playlist_button";
    button.setAttribute("onclick", 'javascript:Data.removeSong("'+songName+'", "'+artist+'", "'+album+'","'+preview+'","'+image+'")');

    var i = document.createElement("i");
    i.setAttribute("class", "fa fa-minus-circle");

    button.appendChild(i);

    document.getElementById("play_song").appendChild(button);
    
    //Refresquem la pàgina 
    if (document.getElementById("myPlaylist")) {
      MusicRecommender.playlist();
    }
  },

  get : function () {
    return this.myPlaylist;
  },
}


/******************************************************************************************

                        Objecte que s'encarregarà de gestionar totes les dades 
                        que arribin en format JSON i de veure el contingut per
                        pantalla

******************************************************************************************/
var MusicRecommender = {

  //Clau que permetrà obtenir dades de la API de lastfm
  API_key : 'b57f76564e8f63079b877369792e1aa0',
  tracks : '',

  //Funció que pintarà per pantalla el menú superior
  menuBar : function () {
    var div_menu = document.createElement("div");
    div_menu.setAttribute("id","cssmenu");

    var ul = document.createElement("ul");

    var li = document.createElement("li");

    var a = document.createElement("a");
    a.href = "javascript:MusicRecommender.searchLayout();";

    var span = document.createElement("span");
    span.setAttribute("class","fa fa-search");

    a.appendChild(span);
    a.appendChild(document.createTextNode("Search"));
    li.appendChild(a);
    ul.appendChild(li);

    li = document.createElement("li");
    a = document.createElement("a");

    a.href = "javascript:MusicRecommender.topTracks();";

    var span = document.createElement("span");
    span.setAttribute("class","fa fa-bar-chart");

    a.appendChild(span);
    a.appendChild(document.createTextNode("Top Music"));
    li.setAttribute("class","active");
    li.appendChild(a);
    ul.appendChild(li);

    li = document.createElement("li");
    a = document.createElement("a");

    a.setAttribute("href","#");

    var span = document.createElement("span");
    span.setAttribute("class","fa fa-folder");

    a.appendChild(span);
    a.appendChild(document.createTextNode("Playlist"));
    a.href = "javascript:MusicRecommender.playlist();";
    li.appendChild(a);
    ul.appendChild(li);

    div_menu.appendChild(ul);
    document.body.appendChild(div_menu);
  },

  //Funció que eliminarà tot el que es mostra per pantalla
  removePreviousData : function () {
      if (document.getElementById("artist_image") != null) {
        document.getElementById("artist_image").parentNode.removeChild(document.getElementById("artist_image"));
      }
      if (document.getElementById("songs_list") != null) {
        document.getElementById("songs_list").parentNode.removeChild(document.getElementById("songs_list"));
      }
      if (document.getElementById("intro_image") != null) {
        document.getElementById("intro_image").parentNode.removeChild(document.getElementById("intro_image"));
      }
      if (document.getElementById("artists") != null) {
        document.getElementById("artists").parentNode.removeChild(document.getElementById("artists"));
      }
      if (document.getElementById("albums") != null) {
        document.getElementById("albums").parentNode.removeChild(document.getElementById("albums"));
      }
      if (document.getElementById("tracks") != null) {
        document.getElementById("tracks").parentNode.removeChild(document.getElementById("tracks"));
      }
      if (document.getElementById("nothing") != null) {
        document.getElementById("nothing").parentNode.removeChild(document.getElementById("nothing"));
      }
  },

  //Funció que pintarà per pantalla la imatge principal
  mainPage : function () {
    var div = document.createElement("div");
    div.setAttribute("id","intro_image");

    var image = document.createElement("img");
    image.setAttribute("src","imagenes/main.jpg");
    image.setAttribute("id","main_background");

    div.appendChild(image);

    document.body.appendChild(div);
  },

  //Funció que mostrarà per pantalla els top tracks, albums i artistes
  showTopData : function (artist, albums) {
    var div_content_artists = document.createElement("div");
    div_content_artists.id = "artists";

    var div_content_tracks = document.createElement("div");
    div_content_tracks.id = "tracks";

    var div_content_albums = document.createElement("div");
    div_content_albums.id = "albums";

    //Creem cada un dels headers i els afegim al div on hi haurà
    //tots les cançons/artistes/àlbums
    var div_header = document.createElement("div");
    div_header.id = "header_artists"; 
    div_header.appendChild(document.createTextNode("Top 20 Artists"));

    div_content_artists.appendChild(div_header);

    /***********Fem el mateix per TRACKS***********/
    div_header = document.createElement("div");
    div_header.id = "header_tracks"; 
    div_header.appendChild(document.createTextNode("Top 20 Tracks"));
    
    div_content_tracks.appendChild(div_header);

    /***********I per ALBUMS***********/
    div_header = document.createElement("div");
    div_header.id = "header_albums"; 
    div_header.appendChild(document.createTextNode("Top 20 Albums"));
    
    div_content_albums.appendChild(div_header);

    var div_data_artists = document.createElement("div");
    div_data_artists.id = "top_artists";

    var div_data_tracks = document.createElement("div");
    div_data_tracks.id = "top_tracks";

    var div_data_albums = document.createElement("div");
    div_data_albums.id = "top_tracks";

    var ul_artists = document.createElement("ul");
    var ul_tracks = document.createElement("ul");
    var ul_albums = document.createElement("ul");

    var li = document.createElement("li");

    var a = document.createElement("a");

    var image = document.createElement("img");

    var info = document.createElement("h4");
    //Fem un bucle que recorri el json que ens ha arribat
    //de cada un dels àlbums que arribi, es mostrarà la imatge,
    //el nom del cantant
    //En un principi es mostraran els 20 primers
    for (i = 0; i < 20; i++) {

      /************** ARTISTS **************/
      //Omplim cada un dels elements del llistat amb un element de tipus a
      //i es controla que pugui NO haver cap imatge disponible
      a.id = "artists";
      a.setAttribute("href",'javascript:MusicRecommender.list("'+artist.artists.artist[i].name+'","imagenes/unnamed.png",0,"")');

      image.setAttribute("src","imagenes/unnamed.png");
      if (artist.artists.artist[4].image != null) {
        //Voldrà dir que existeix imatge
        image.setAttribute("src",artist.artists.artist[i].image[4]['#text']);
        a.setAttribute("href",'javascript:MusicRecommender.list("'+artist.artists.artist[i].name+'","'+artist.artists.artist[i].image[4]['#text']+'",0,"")');
      }

      info.appendChild(document.createTextNode(artist.artists.artist[i].name));

      a.appendChild(image);
      a.appendChild(info);

      li.appendChild(a);
      ul_artists.appendChild(li);

      //Es creen noves variables per fer els TRACKS
      li = document.createElement("li");
      a = document.createElement("a");
      image = document.createElement("img");
      info = document.createElement("h4");

      /****************************************

          Per cada una de la informació hi 
          haurà per artistes i cançons més 
          populars

      ****************************************/

      /************** TRACKS **************/

      //Omplim cada un dels elements del llistat amb un element de tipus a
      //i es controla que pugui NO haver cap imatge disponible
      a.setAttribute("href",'javascript:Player.play("'+this.tracks.tracks.track[i].name+'","'+this.tracks.tracks.track[i].artist.name+'")');

      a.id = "tracks";
      image.setAttribute("src","imagenes/unnamed.png");
      if (this.tracks.tracks.track[3].image != null) {
        //Voldrà dir que existeix imatge
        image.setAttribute("src",this.tracks.tracks.track[i].image[3]['#text']);
      }

      info.appendChild(document.createTextNode(this.tracks.tracks.track[i].name));

      a.appendChild(image);
      a.appendChild(info);

      li.appendChild(a);
      ul_tracks.appendChild(li);

      //Es creen noves variables per la següent vegada
      li = document.createElement("li");
      a = document.createElement("a");
      image = document.createElement("img");
      info = document.createElement("h4");

      /************** ALBUMS **************/

      a.id = "albums";
      a.setAttribute("href",'javascript:MusicRecommender.list("'+albums.albums.items[i].name+'","imagenes/unnamed.png",2,"'+albums.albums.items[i].id+'")');

      image.setAttribute("src","imagenes/unnamed.png");
      if (albums.albums.items[i].images != null) {
        //Voldrà dir que existeix imatge
        image.setAttribute("src",albums.albums.items[i].images[0].url);
        a.setAttribute("href",'javascript:MusicRecommender.list("'+albums.albums.items[i].name+'","'+albums.albums.items[i].images[0].url+'",1,"'+albums.albums.items[i].id+'")');
      }

      info.appendChild(document.createTextNode(albums.albums.items[i].name));

      a.appendChild(image);
      a.appendChild(info);

      li.appendChild(a);
      ul_albums.appendChild(li);

      //Es creen noves variables per fer els TRACKS
      li = document.createElement("li");
      a = document.createElement("a");
      image = document.createElement("img");
      info = document.createElement("h4");

    }

    div_data_tracks.appendChild(ul_tracks);
    div_data_artists.appendChild(ul_artists);
    div_data_albums.appendChild(ul_albums);

    div_content_artists.appendChild(div_data_artists);
    div_content_albums.appendChild(div_data_albums);
    div_content_tracks.appendChild(div_data_tracks);

    document.body.appendChild(div_content_artists);
    document.body.appendChild(div_content_albums);
    document.body.appendChild(div_content_tracks);
  },

  //Mostrarà els diferents albums i cançons un cop ens han fet click 
  showData : function (data, id, album_name) {
    var div = document.createElement("div");

    var div_header = document.createElement("div");

    var div_data = document.createElement("div");

    var ul = document.createElement("ul");

    var li = document.createElement("li");

    var a = document.createElement("a");

    var img = document.createElement("img");

    var h4 = document.createElement("h4");

    switch (id) {
      //Cas de mostrar els àlbums quan ens fan click a veure un artista
      case 0:
        div.id = "albums";
        div_header.id = "header_albums";

        //Especifiquem un títol 
        div_header.appendChild(document.createTextNode("Important albums"));

        div.appendChild(div_header);

        //S'apilicarà el mateix css que en la pantalla principal
        div_data.id = "top_artists";

        for (i = 0; i < 15; i ++) {
          a.id = "albums";
          a.setAttribute("href",'javascript:MusicRecommender.list("'+data.albums.items[i].name+'","imagenes/unnamed.png",1,"'+data.albums.items[i].id+'")');

          img.setAttribute("src","imagenes/unnamed.png");

          if (data.albums.items[i].images != null) {
            //Voldrà dir que existeix imatge
            img.setAttribute("src",data.albums.items[i].images[0].url);
            a.setAttribute("href",'javascript:MusicRecommender.list("'+data.albums.items[i].name+'","'+data.albums.items[i].images[0].url+'",1,"'+data.albums.items[i].id+'")');
          }

          h4.appendChild(document.createTextNode(data.albums.items[i].name));

          a.appendChild(img);
          a.appendChild(h4);

          li.appendChild(a);
          ul.appendChild(li);

          //Creem nous elements per la següent volta
          li = document.createElement("li");
          a = document.createElement("a");
          img = document.createElement("img");
          h4 = document.createElement("h4");
        }

        div_data.appendChild(ul);
        div.appendChild(div_data);

        document.body.appendChild(div);

        break;
      //Cas de mostrar les top cançons quan ens fan click a veure un artista
      case 1:
        div.id = "tracks";
        div_header.id = "header_tracks";

        //Especifiquem un títol 
        div_header.appendChild(document.createTextNode("Important tracks"));

        div.appendChild(div_header);

        //S'apilicarà el mateix css que en la pantalla principal
        div_data.id = "top_tracks";

        for (i = 0; i < 15; i ++) {
          a.id = "tracks";
          a.setAttribute("href",'javascript:Player.play("'+data.tracks.items[i].name+'","'+data.tracks.items[i].artists[0].name+'")');

          img.setAttribute("src","imagenes/unnamed.png");

          if (data.tracks.items[i].album.images != null) {
            //Voldrà dir que existeix imatge
            img.setAttribute("src",data.tracks.items[i].album.images[0].url);
          }
          
          a.appendChild(img);
          
          //Mostrarem el nom del àlbum i el nom de la cançó
          h4.appendChild(document.createTextNode(data.tracks.items[i].album.name));
          a.appendChild(h4);

          h4 = document.createElement("h4");

          h4.appendChild(document.createTextNode(data.tracks.items[i].name));

          a.appendChild(h4);

          li.appendChild(a);
          ul.appendChild(li);

          //Creem nous elements per la següent volta
          li = document.createElement("li");
          a = document.createElement("a");
          img = document.createElement("img");
          h4 = document.createElement("h4");
        }

        div_data.appendChild(ul);
        div.appendChild(div_data);

        document.body.appendChild(div);

        break;
      //Cas de mostrar les cançons quan ens fan click a veure un àlbum
      case 2: 
        div.id = "tracks";
        div_header.id = "header_tracks";

        //Especifiquem un títol 
        div_header.appendChild(document.createTextNode("Tracks"));

        div.appendChild(div_header);

        //S'apilicarà el mateix css que en la pantalla principal
        div_data.id = "top_tracks";

        //Per mostrar el llistat de cançons es farà una taula responsive
        var table = document.createElement("table");
        table.setAttribute("class","rwd-table");

        var tr = document.createElement("tr");
        
        //Es crea el "header" de la taula
        var th = document.createElement("th");
        th.appendChild(document.createTextNode("Nº"));
        tr.appendChild(th);
        th = document.createElement("th");
        th.appendChild(document.createTextNode("Play"));
        tr.appendChild(th);
        th = document.createElement("th");
        th.appendChild(document.createTextNode("Title"));
        tr.appendChild(th);
        th = document.createElement("th");
        th.appendChild(document.createTextNode("Artist"));
        tr.appendChild(th);
        th = document.createElement("th");
        th.appendChild(document.createTextNode("Album"));
        tr.appendChild(th);

        table.appendChild(tr);

        var td = document.createElement("td");

        //S'utilitzarà per poder reproduir la cançó
        var play_button = document.createElement("button");
        var i_play = document.createElement("i");
        
        tr = document.createElement("tr");
        
        for (i = 0; i < data.items.length; i ++) {

          /******* PRIMERA COLUMNA *******/
          td.setAttribute("data-th","Nº");

          td.appendChild(document.createTextNode(i+1));

          tr.appendChild(td);

          /******* SEGONA COLUMNA *******/
          td = document.createElement("td");
          td.setAttribute("data-th","Play");

          i_play.setAttribute("class", "fa fa-play");
          play_button.setAttribute("onclick",'Player.play("'+data.items[i].name+'","'+data.items[i].artists[0].name+'")');
          play_button.appendChild(i_play);

          td.appendChild(play_button);

          tr.appendChild(td);

          /******* TERCERA COLUMNA *******/
          td = document.createElement("td");
          td.setAttribute("data-th","Title");

          td.appendChild(document.createTextNode(data.items[i].name));

          tr.appendChild(td);

          /******* QUARTA COLUMNA *******/
          td = document.createElement("td");
          td.setAttribute("data-th","Artist");

          td.appendChild(document.createTextNode(data.items[i].artists[0].name));

          tr.appendChild(td);

          /******* CINQUENA COLUMNA *******/
          td = document.createElement("td");
          td.setAttribute("data-th","Album");
          td.setAttribute("class","album_name");

          td.appendChild(document.createTextNode(album_name));

          tr.appendChild(td);

          table.appendChild(tr);

          tr = document.createElement("tr");
          td = document.createElement("td");
          play_button = document.createElement("button");
          i_play = document.createElement("i");

        }

        div_data.appendChild(table);
        div.appendChild(div_data);

        document.body.appendChild(div);
        break;
    }
  },

  //Funció que agafarà la info de les cançons més top que hi hagin actualment
  topTracks : function () {
    //En cas que ja hi haguessin els albums mostrant-se, no els mostrem un altre cop
    MusicRecommender.removePreviousData();

    MusicRecommender.mainPage();

    //Fem les peticions i les mostrem per pantalla
    var artist = AJAX.request('http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key='+this.API_key+'&format=json');
    this.tracks = AJAX.request('http://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key='+this.API_key+'&format=json');
    var albums = AJAX.request('https://api.spotify.com/v1/search?q=tag:new&type=album');

    MusicRecommender.showTopData(artist, albums);
  },

  //Servirà per poder obtenir les diferents albums del àlbum seleccionat
  list : function (name, image, id, spotify_id) {
    switch (id) {
      //Cas de click en artistes
      case 0:
        MusicRecommender.removePreviousData();
        //En cas de que el id sigui 0 voldrà dir que ens han premut un artista, per tant es mostraran àlbums i cançons
        var albums = AJAX.request('https://api.spotify.com/v1/search?q='+name+'&type=album');
        var songs = AJAX.request('https://api.spotify.com/v1/search?q='+name+'&type=track');

        //Obtenim la info de l'artista
        var inf = AJAX.request('http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key='+this.API_key+'&artist='+name+'&format=json');

        //Per poder veure el títol informatiu i la imatge en gran
        var div = document.createElement("div");
        div.id = "intro_image";

        var p = document.createElement("p");
        //Eliminem els diferents tags html que puguin haver dins el text
        p.appendChild(document.createTextNode(inf.artist.bio.summary.replace(/<(?:.|\n)*?>/gm, '')));

        var div_info = document.createElement("div");
        div_info.id = "info_artist";
        div_info.appendChild(p);

        var img = document.createElement("img");
        img.setAttribute("src",image);
        img.id = "main_background";
        var h1 = document.createElement("h1");
        h1.appendChild(document.createTextNode("Top songs & albums from "+name));
        div.appendChild(h1);
        div.appendChild(div_info);
        div.appendChild(img);
        
        document.body.appendChild(div);

        MusicRecommender.showData(albums,0,"");
        MusicRecommender.showData(songs,1,"");
        break;
      //Cas en que ens hauran premut un àlbum i per tant es mostraran les cançons de l'àlbum
      case 1: 
        MusicRecommender.removePreviousData();
        var songs = AJAX.request('https://api.spotify.com/v1/albums/'+spotify_id+'/tracks');
        
        //Per poder veure el títol informatiu i la imatge en gran
        var div = document.createElement("div");
        div.id = "intro_image";

        var img = document.createElement("img");
        img.setAttribute("src",image);
        img.id = "main_background";
        var h1 = document.createElement("h1");
        h1.appendChild(document.createTextNode("Songs from "+name));
        div.appendChild(h1);
        div.appendChild(img);
        
        document.body.appendChild(div);

        MusicRecommender.showData(songs,2,name);

        break; 
    }
  },

  //Funció que servirà per poder veure el buscador
  searchLayout : function () {
    MusicRecommender.removePreviousData();
    MusicRecommender.mainPage();

    var div = document.createElement("div");
    div.id = "search";

    var form = document.createElement("form");
    form.setAttribute("action", "javascript:MusicRecommender.search();");

    var input = document.createElement("input");
    input.id = "search_input";

    var button = document.createElement("button");
    button.id = "search_button";

    var i = document.createElement("i");
    i.setAttribute("class", "fa fa-search");

    button.appendChild(i);

    form.appendChild(input);
    form.appendChild(button);

    div.appendChild(form);

    document.getElementById("intro_image").insertBefore(div, document.getElementById("intro_image").firstChild);
  },
  
  //Funció que buscarà el que ens hagin introduit
  search : function () {
    var nothing = 0;

    var albums = AJAX.request('https://api.spotify.com/v1/search?q='+document.getElementById("search_input").value+'&type=album');
    var songs = AJAX.request('https://api.spotify.com/v1/search?q='+document.getElementById("search_input").value+'&type=track');
    
    MusicRecommender.removePreviousData();
    MusicRecommender.mainPage();
    if (albums.albums.items.length != 0) 
      MusicRecommender.showData(albums,0,"");
    else
      nothing = 1;
    if (songs.tracks.items.length != 0) 
      MusicRecommender.showData(songs,1,"");
    else
      nothing = 1;

    if (nothing) {
      var div = document.createElement("div");
      div.id = "nothing";

      div.appendChild(document.createTextNode("Ups!! Nothing found!"));

      document.body.appendChild(div);
    }
  },

  //Funció que obtindrà les cançons guardades a "favoritos"
  playlist : function () {
    MusicRecommender.removePreviousData();
    MusicRecommender.mainPage();

    var fav = Data.get();

    var div = document.createElement("div");
    var div_header = document.createElement("div");
    var div_data = document.createElement("div");
    var a = document.createElement("a");
    var img = document.createElement("img");
    var h4 = document.createElement("h4");
    var h5 = document.createElement("h5");
    var h6 = document.createElement("h6");
    var ul = document.createElement("ul");
    ul.id = "myPlaylist";
    var li = document.createElement("li");

    div.id = "tracks";
    div_header.id = "header_tracks";

    //Especifiquem un títol 
    div_header.appendChild(document.createTextNode("My top tracks"));

    div.appendChild(div_header);

    //S'apilicarà el mateix css que en la pantalla principal
    div_data.id = "top_tracks";

    for (i = 0; i < fav.length; i ++) {
      a.id = "tracks";
      a.setAttribute("href",'javascript:Player.play("'+fav[i]["name"]+'","'+fav[i]["artist"]+'")');

      img.setAttribute("src",fav[i]["image"]);

      a.appendChild(img);

      //Mostrarem el nom del artista, del àlbum i el nom de la cançó
      h4.setAttribute("class", "info_myTop");
      h4.appendChild(document.createTextNode(fav[i]["artist"]));
      h5.setAttribute("class", "info_myTop");
      h5.appendChild(document.createTextNode(fav[i]["album"]));
      h6.setAttribute("class", "info_myTop");
      h6.appendChild(document.createTextNode(fav[i]["name"]));
      a.appendChild(h4);
      a.appendChild(h5);
      a.appendChild(h6);

      li.appendChild(a);
      ul.appendChild(li);

      //Creem nous elements per la següent volta
      li = document.createElement("li");
      a = document.createElement("a");
      img = document.createElement("img");
      h4 = document.createElement("h4");
      h5 = document.createElement("h5");
      h6 = document.createElement("h6");
    }

    div_data.appendChild(ul);
    div.appendChild(div_data);

    document.body.appendChild(div);
  },

  main : function () {
    MusicRecommender.menuBar();
    MusicRecommender.mainPage();
    MusicRecommender.topTracks();
  },
}

MusicRecommender.main();

