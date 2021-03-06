

var docbao =  angular.module('docbaoApp', []);
var on_same_page = false;

docbao.controller('logCtrl', function($scope, $http)
{	
    waiting = $("#waiting")
    waiting.show(700);
    $http.get('/export/log_data.json').then(function (response)
    {
        $scope.log = response.data; //success callback
    }
    , function (data){
        console.log("Khong doc duoc file log_data.json");
    }    //fail callback
    );
/*
   $http.get('/export/keyword_dict.json').then(function (response)
    {
        draw_category_table(response.data.data);
    }
    , function (data){
        console.log("Khong doc duoc file keyword_dict.json");
    }    //fail callback
    );
*/

   $http.get('/export/trending_keyword.json').then(function (response)
    {
        var data = response.data.trending_keyword_list;
	var trend_duration = response.data.trending_duration;
        draw_hot_keyword_barchart(data, trend_duration);

	//build recommended keyword to search
	var keyword_string = ""
	for(var i=0; i<data.length; i++)
	    {
		    keyword_string = keyword_string + data[i].keyword + " - "
	    }
	$scope.keyword_string = keyword_string; 
        
    }
    , function (data){
        console.log("Khong doc duoc file trending_keyword.json");
    }    //fail callback
    );

   $http.get('/export/trending_article.json').then(function (response)
    {
        var data = response.data.trending_article_list;
        draw_trending_article_table(data);

    }
    , function (data){
        console.log("Khong doc duoc file trending_article.json");
    }    //fail callback
    );
/*
   $http.get('/export/hot_growing_article.json').then(function (response)
    {
        var data = response.data.hot_growing_article_list;
        draw_hot_growing_article_table(data);

    }
    , function (data){
        console.log("Khong doc duoc file hot_growing_article.json");
    }    //fail callback
    );

    $http.get('/export/new_keyword.json').then(function (response)
    {
        var data = response.data;
        draw_new_keyword_table(data);
    }
    , function (data){
        console.log("Khong doc duoc file new_keyword.json");
    }    //fail callback
    );
*/

   //setup article_table
    draw_article_table();
    setup_auto_complete();

    setTimeout(function() {
    var fType = decodeURI(getUrlVars()["keyword"]);
    if (fType != "undefined" && !on_same_page) _search_article_table(fType);
    },3000);

});

function draw_hot_keyword_barchart(trending_keyword_list, trending_duration)
{
    // -- Bar Chart Example
console.log(trending_keyword_list);
var ctx = document.getElementById("myBarChart");
var keywords = []
var increase_freqs = []
  for (var i=0; i< trending_keyword_list.length; i++)
	{
		var item = trending_keyword_list[i];
		console.log(item);
		keywords.push(item.keyword);
		increase_freqs.push(item.increase_freq);
	}
console.log(keywords);
console.log(increase_freqs)

var label_text = "S??? tin t???c m???i xu???t b???n trong " + trending_duration + " ch???a t??? kh??a n??y";
var myLineChart = new Chart(ctx, {
  type: 'horizontalBar',
  data: {
    labels: keywords,
    datasets: [{
      label: label_text,
      backgroundColor: "rgba(2,117,216,1)",
      borderColor: "rgba(2,117,216,1)",
      data: increase_freqs,
    }],
  },
  options: {
    responsive:true,
    maintainAspectRatio:false,
    scales:{
	yAxis:[{
	  ticks:
		{
		  beginAtZero:true
		}
	}
	]
    },
    onClick: function(evt){
    var activeElement = myLineChart.getElementAtEvent(evt)[0]._index;
    var search_string = keywords[activeElement];
    on_same_page = true;
    _search_article_table(search_string);
    
    },
  }
    });
}

function draw_article_table()
{
 
$(document).ready(function() {
	create_article_table();
   } );
}
function create_article_table()
{

    $('#article_table').DataTable( {
	processing: true,
	serverSide: true,
	ajax: "./get_articles_from_es.php",
	
        columns: [
            { title: "STT", data:"stt", "searchable": false, className: "min-desktop"},
            { title: "T??n b??i", data:"topic", "searchable": true, className:"all"},
            { title: "Ngu???n b??o", data:"newspaper", "searchable": false, className:"min-desktop"},
            { title: "C???p nh???t", data:"update_time", "searchable": false, className: "min-desktop" },
            { title: "Xu???t b???n", data:"publish_time", "searchable": false, className: "min-desktop" },
        ],
	
        "rowCallback": function( row, data, index ) {
            topic = $('td:eq(1)', row).html();
            $('td:eq(1)', row).html('<a href="' + data.href + '" target="_blank">' + topic + '</a>');
          },
        responsive: true,
        columnDefs: [
            { responsivePriority: 1, targets: 1 },
            { responsivePriority: 2, targets: 2 }
        ],
        nowrap: true,
	"pageLength": 50,
	paging: true,
	scrollY: 800,
	deferRender: true,
	
    } );
   $("#waiting").hide(700);
   $("#load_success").show(700);
   window.setTimeout(function(){
   	$("#load_success").hide(700);
   }, 1000);
 
}

function draw_trending_article_table(article_list)
{
 
$(document).ready(function() {
	create_trending_article_table(article_list);
   } );
}

function create_trending_article_table(article_list)
{

    var dataset = article_list;
    $('#trending_article_table').DataTable( 
	{
        data: dataset,
        columns: [
            { title: "Ch??? ?????", data:"keyword", "searchable": false, className: "min-desktop"},
            { title: "T??n b??i", data:"topic", "searchable": false, className:"all"},
            { title: "Ngu???n b??o", data:"newspaper", "searchable": false, className:"min-desktop"},
            { title: "C???p nh???t", data:"update_time", "searchable": false, className: "min-desktop" },
        ],
        "rowCallback": function( row, data, index ) {
            topic = $('td:eq(1)', row).html();
            $('td:eq(1)', row).html('<a href="' + data.href + '" target="_blank">' + topic + '</a>');
          },
        responsive: true,
        columnDefs: [
            { responsivePriority: 1, targets: 1 },
            { responsivePriority: 2, targets: 2 }
        ],
        nowrap: true,
	"pageLength": 5, 
	paging: false,
	scrollY: 400,
	ordering: false,
	deferRender: true
    } );
}

function draw_hot_growing_article_table(article_list)
{
 
$(document).ready(function() {
	create_hot_growing_article_table(article_list);
   } );
}

function create_hot_growing_article_table(article_list)
{

    var dataset = article_list;
    $('#hot_growing_article_table').DataTable( 
	{
        data: dataset,
        columns: [
            { title: "Ch??? ?????", data:"keyword", "searchable": false, className: "min-desktop"},
            { title: "T??n b??i", data:"topic", "searchable": false, className:"all"},
            { title: "Ngu???n b??o", data:"newspaper", "searchable": false, className:"min-desktop"},
            { title: "C???p nh???t", data:"update_time", "searchable": false, className: "min-desktop" },
        ],
        "rowCallback": function( row, data, index ) {
            topic = $('td:eq(1)', row).html();
            $('td:eq(1)', row).html('<a href="' + data.href + '" target="_blank">' + topic + '</a>');
          },
        responsive: true,
        columnDefs: [
            { responsivePriority: 1, targets: 1 },
            { responsivePriority: 2, targets: 2 }
        ],
        nowrap: true,
	"pageLength": 5, 
	paging: false,
	scrollY: 400,
    } );
}
function draw_new_keyword_table(new_keyword_list)
{
var data = new_keyword_list;
console.log(data);
$(document).ready(function() 
    {
        keyword_string = "";
        for(i=0; i< data.length; i++)
        {
           keyword_string = keyword_string + '<a href="#article_table" onclick ="search_article_table(this)">' + 
           data[i].keyword + '</a>' + '<sub>(' + data[i].count +
                     ')</sub>' + ' - ';
         }

                $("#new_keyword_row").html(keyword_string);

   }
             );
}


function draw_category_table(category_list)
{
var dataset = category_list;
console.log(dataset);
$(document).ready(function() 
    {
        $('#category_table').DataTable( {
            data: dataset,
            columns: [
                { title: "Chuy??n m???c", data:"category"},
                { title: "Keyword", data:"keywords"},

            ],
            "ordering": false,
            "autoWidth": false,
	    "pageLength": 50,
            "rowCallback": function( row, data, index ) {
                topic = $('td:eq(1)', row).html();
                keyword_string = "";
                console.log(data);
                for(i=0; i< data.keywords.length; i++)
                {
                    keyword_string = keyword_string + '<a href="#article_table" onclick ="search_article_table(this)">' + 
                    data.keywords[i].keyword + '</a>' + '<sub>(' + data.keywords[i].count +
                     ')</sub>' + ' - ';
                }

                $('td:eq(1)', row).html(keyword_string);
              },
        } );
    } );
}

function _search_article_table(search_string)
{
    if(confirm("?????c c??c b??i b??o c?? ch???a t??? kh??a: " + search_string))
        {
	
	table = $('#article_table').DataTable();
	
	//addKeywordToUrl(search_string);
	//search_string = '"' + search_string + '"';	
        table.search(search_string).draw();

        $('html, body').animate({
          scrollTop: $("#article_table").offset().top
        }, 900);
    }
}

function search_article_table(keyword)
{
    search_string =  keyword.text ;
    on_same_page = true;
    _search_article_table(search_string);
}

function keyup_on_keyword_search_text(event)
{
    if (event.keyCode === 13) {
        search_keyword();
    }
}

function search_keyword()
{
    on_same_page = true;
    _search_article_table($("#keyword_search_text").val());
}

function go_to_search_card()
{
    $('html, body').animate({
      scrollTop: $("#search_card").offset().top
    }, 900);
}

function setup_auto_complete()
{
/*
    for(var i=0; i < max_item ; i++)
    {
        states.push({"title":article_list[i].topic + " (" + article_list[i].newspaper + ")", "value": article_list[i].topic});
    }
*/
  var xhr;

    $("#keyword_search_text").autoComplete({
    source: function(term, suggest){
	        try { xhr.abort(); } catch(e){}
	        var word_count = term.split(" ").length;
	        xhr = $.getJSON('get_autocomplete_from_es.php', {q: term, length:word_count}, function(data){suggest(data);});
	    },
    renderItem:function (item, search){
	    search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
	    return '<div class="autocomplete-suggestion" data-val="' + item.topic + '">' + item.topic.replace(re, "<b>$1</b>") + ' (' + item.newspaper+ ')' + '</div>';
            },
    visibleLimit: 10,
    minChars: 0,
    delay: 500
    },
    onSelect=function(e, term, item){
	    search_keyword(item.topic)}
    )
}
function clear_search_text()
{
  $("#keyword_search_text").val("");
}
function addKeywordToUrl(keyword)
{
	var url = window.location.href.split('?')[0];
	window.history.replaceState({page:"another"}, keyword, url + "?keyword=" + encodeURI(keyword));
}
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

