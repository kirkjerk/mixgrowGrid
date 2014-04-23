mixgrowGrid
===========

an infinite-scrolling (grow) table builder for hierarchical (mix) JSON.

It is meant as a spiritual replacement for datatables, one that handles mixed
data rows and colspans and infinite-scrolling that takes up the page more gracefully.

see [this blog entry](http://kirkdev.blogspot.com/2014/04/cheap-infinite-scroll-in-jquery.html) for more info.

Here is a sample setup.

`
                    var intRenderer = ValueRenderer.numberRenderer(0);
                    var percentRenderer = ValueRenderer.percentRenderer(2);
                    var currencyRenderer = ValueRenderer.currencyRenderer("$");
                    var dateRenderer = ValueRenderer.dateRenderer();
                    var dateRenderer = ValueRenderer.dateRenderer();
                    var microCurrencyRenderer =  ValueRenderer.microCurrencyRenderer();
                    var imageRender = function(data){
                        if(data){
                            return "<img src='"+data+"'>";
                        }
                        return "";
                    }

                    var scrollToTop = function(){
                        jQuery('html, body').animate({scrollTop: 0}, 500);
                    }

                    var addStuffToHeader = function(){
                        jQuery("#placeDecoration").append("<div class='scrollToTop'>Show Menu</div>");
                        jQuery(".scrollToTop").click(scrollToTop);
                    };



                    var onSave;

                    var remoteClient = new mixgrowClientRemoteSorting(110714);
                    var localClient = new mixgrowClientLocalSorting("/loadcampaign/110714/sites?sortField=totalSpend&sortOrder=desc&offset=0&count=100");


                    var client = localClient;

                    var mixgrowConfig = {
                        "location":"#optLocation", //CSS selector
                        "dataLoader":client.runDataQuery,
                        "tallyLoader":client.runTallyQuery,
                        "summaryMessageCallback":client.getSummaryMessage,

                        "sorting":{
                             "initialSortField":"totalSpend"
                        },

                        "recordsPerLoad":10, //this might vary? in our case it's toplevel

                        "hierarchy":["sites","placements"],

                        "rowClasses":{
                            "sites":"mixgrow_parent"
                        },
                        "decorativeHeader":{
                            "location":"top",
                            columns:[
                                //{"class":"",colspan:"",caption:"",id:""},
                                {"class":"bottomborder","colspan":"5","caption":"", id:"placeDecoration"},
                                {"class":"litegray headdec",colspan:"6","caption":"PERFORMANCE"},
                                {"class":"medgray headdec",colspan:"1","caption":"BID"},
                                {"class":"darkgray headdec",colspan:"4","caption":"CONVERSION"}
                             ]


                        },
                        "orderable":true, //sets a default
                        "afterHeaderBuiltCallback":addStuffToHeader,
                        "columns":{
                            "sites":
                                    [
                                        {"data":"checkbox","orderable":false,"type":"html","class": "textleft ", "special":"blank"},
                                        {"data": "status","class": "firstSection","orderable": false, "render":imageRender},
                                        {"data":"siteName","class": "firstSection siteOrPlacementName","headerLabel":"Site &amp;<br />Placement", "filter":"text"},
                                        {"data":"publisherName","class": "firstSection","headerLabel":"Publisher","headerLabel":"Publisher","filter":"text"},
                                        {"data":"networkName","class": "firstSection finalInSection minWidth100","headerLabel":"Network","filter":"select"},
                                        {"data":"impressions","render": intRenderer,"class": "numberRenderer","headerLabel":"Imps"},
                                        {"data":"ctr","render": percentRenderer,"class": "textright","headerLabel":"CTR"},
                                        {"data":"clicks","render": intRenderer,"class": "numberRenderer","headerLabel":"Clicks"},
                                        {"data":"totalSpend","render": microCurrencyRenderer,"class": "textright","headerLabel":"Cost",
                                            "editable": {"type": "numeric","onSave": onSave}},
                                        {"data":"ecpm","render": microCurrencyRenderer,"class": "textright","headerLabel":"eCPM"},
                                        {"data":"avgCPC","render": microCurrencyRenderer,"class": "textright finalInSection","headerLabel":"Avg. CPC"},
                                        {"data":"bid","render": microCurrencyRenderer,"class": "textright first","headerLabel":"Bid"},
                                        {"data":"updateMode","class": "textright finalInSection minWidth100","orderable": false,"headerLabel":"Update","filter":"select"},
                                        {"data":"costPerConversion","render": microCurrencyRenderer,"class": "textright first minWidth50","headerLabel":"Cost/&shy;Conv"},
                                        {"data":"conversions","render": intRenderer,"class": "textright minWidth50","headerLabel":"# of<br />Conv"},
                                        {"data":"conversionPct","render": percentRenderer,"class": "textright  finalInSection minWidth75","headerLabel":"Conv%"}
                                    ],

                            "placements":[
                                        {"data":"checkbox","orderable":false,"type":"html","class": "textleft ", "special":"selection"},
                                        {"data": "status","class": "firstSection","orderable": false},
                                        {"data":"adSpotSize","class": "firstSection siteOrPlacementName pushleft","colspan":3},
                                        {"data":"impressions","render": intRenderer,"class": "numberRenderer"},
                                        {"data":"ctr","render": percentRenderer,"class": "textright"},
                                        {"data":"clicks","render": intRenderer,"class": "numberRenderer"},
                                        {"data":"totalSpend","render": microCurrencyRenderer,"class": "textright",
                                            "editable": {"type": "numeric","onSave": onSave}},
                                        {"data":"ecpm","render": microCurrencyRenderer,"class": "textright"},
                                        {"data":"avgCPC","render": microCurrencyRenderer,"class": "textright finalInSection"},
                                        {"data":"bid","render": microCurrencyRenderer,"class": "textright first"},
                                        {"data":"updateMode","class": "textright finalInSection","orderable": false},
                                        {"data":"costPerConversion","render": microCurrencyRenderer,"class": "textright first"},
                                        {"data":"conversions","render": intRenderer,"class": "textright"},
                                        {"data":"conversionPct","render": percentRenderer,"class": "textright  finalInSection"}

                            ]


                        }


                    }
                    jQuery(document).ready(function(){
                        mixgrowGrid.initializeGrid(mixgrowConfig);
                    });


                });



`