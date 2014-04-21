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


                    var onSave;

                    var imageRender = function(data){
                        if(data){
                            return "<img src='"+data+"'>";
                        }
                        return "";
                    }


                    var optSummaryMessage = function(totalRecordsDisplayed, recordsDisplayedByType,totalRecordsToDisplay){
                        if(totalRecordsToDisplay != undefined){
                            return "Showing "+recordsDisplayedByType['sites']+" sites out of "+totalRecordsToDisplay;
                        } else {
                            return "Showing "+recordsDisplayedByType['sites']+
                                    " sites ("+recordsDisplayedByType['placements']+" spots) total "+totalRecordsDisplayed;
                        }
                    }

                    var mixgrowConfig = {
                        "location":"#optLocation", //CSS selector
                        /*"selectorForLoadingIndicator": //CSS selector, otherwise one will be generated */
                        "url":"/load/campaign/231212/getsites",
                        "tallyurl":"/load/campaign/231212/getsitesTally",

                        "sorting":{
                            "type":"server",
                             "sortFieldParam":"sortField",
                             "sortOrderParam":"sortOrder",
                             "initialSortField":"totalSpend"
                        },


                        "recordsPerLoad":10, //this might vary? in our case it's toplevel

                        summaryMessageCallback:optSummaryMessage,

                        "hierarchy":["sites","placements"],

                        "rowClasses":{
                            "sites":"mixgrow_parent"
                        },


                        "orderable":true, //sets a default

                        "columns":{
                            "sites":
                                    [
                                        {"data":"checkbox","orderable":false,"type":"html","class": "textleft "},
                                        {"data": "status","class": "firstSection","orderable": false, "render":imageRender},
                                        {"data":"siteName","class": "firstSection siteOrPlacementName","headerLabel":"Site &amp;<br />Placement", "filter":"text"},
                                        {"data":"publisherName","class": "firstSection","headerLabel":"Publisher","headerLabel":"Publisher","filter":"text"},
                                        {"data":"networkName","class": "firstSection finalInSection","headerLabel":"Network","filter":"select"},
                                        {"data":"impressions","render": intRenderer,"class": "numberRenderer","headerLabel":"Imps"},
                                        {"data":"ctr","render": percentRenderer,"class": "textright","headerLabel":"CTR"},
                                        {"data":"clicks","render": intRenderer,"class": "numberRenderer","headerLabel":"Clicks"},
                                        {"data":"totalSpend","render": microCurrencyRenderer,"class": "textright","headerLabel":"Cost",
                                            "editable": {"type": "numeric","onSave": onSave}},
                                        {"data":"ecpm","render": microCurrencyRenderer,"class": "textright","headerLabel":"eCPM"},
                                        {"data":"avgCPC","render": microCurrencyRenderer,"class": "textright finalInSection","headerLabel":"Avg. CPC"},
                                        {"data":"bid","render": microCurrencyRenderer,"class": "textright first","headerLabel":"Bid"},
                                        {"data":"updateMode","class": "textright finalInSection","orderable": false,"headerLabel":"Update","filter":"select"},
                                        {"data":"costPerConversion","render": microCurrencyRenderer,"class": "textright first","headerLabel":"Cost/Conv"},
                                        {"data":"conversions","render": intRenderer,"class": "textright","headerLabel":"# of<br />Conv"},
                                        {"data":"conversionPct","render": percentRenderer,"class": "textright  finalInSection","headerLabel":"Conv%"}
                                    ],

                            "placements":[
                                        {"data":"checkbox","orderable":false,"type":"html","class": "textleft "},
                                        {"data": "status","class": "firstSection","orderable": false},
                                        {"data":"adSpotSize","class": "firstSection siteOrPlacementName","colspan":3},
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


`