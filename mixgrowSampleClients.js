


function mixgrowClientLocalSorting(url){
    var searchResults = undefined;



    this.runDataQuery = function(callback,currentOffset,currentFilters,currentSortMap){
        doDataQuery(callback,currentOffset,currentFilters,currentSortMap);
    }

    var doDataQuery  = function(callback,currentOffset,currentFilters,currentSortMap){
        if(currentOffset > 0) callback([]);
        if(searchResults == undefined){

            jQuery.getJSON(url,function(data){
                searchResults = data;
                browserSearchResults(callback, searchResults,currentOffset,currentFilters,currentSortMap);
            });
        } else {
            browserSearchResults(callback,searchResults,currentOffset,currentFilters,currentSortMap);
        }


    }

    this.runTallyQuery = function(callback,currentFilters){
        log("RUNTALLY");
        log(this.runDataQuery+" and "+processTallyQuery +" and "+this.processTallyQuery);
        var results = doDataQuery(function(data){processTallyQuery(callback,data);},0,currentFilters,{});
    }
    var processTallyQuery = function(callback,data){
        var tally = {};
        for(var i = 0; i < data.length; i++){
            var row = data[i];
            for(var key in row){
                var val = row[key];
                log(val);
                if(jQuery.isNumeric(val)){
                    if(tally[key] == undefined) tally[key] = 0;
                    tally[key] += val;
                }
            }
        }

        callback(tally);
    }


    this.getSummaryMessage = function(totalRecordsDisplayed, recordsDisplayedByType,totalRecordsToDisplay){
        if(totalRecordsToDisplay != undefined){
            return "Showing "+recordsDisplayedByType['sites']+" sites out of "+totalRecordsToDisplay;
        } else {
            return "Showing "+recordsDisplayedByType['sites']+
                " sites ("+recordsDisplayedByType['placements']+" spots) total "+totalRecordsDisplayed;
        }
    }

    var alphaFields = {
        "siteName":true,"publisherName":true,"networkName":true
    };

    var browserSearchResults = function(callback,fullData,currentOffset,currentFilters,currentSortMap){

        var sorted = [];
        //apply filters
        for(var i = 0; i < fullData.length; i++){
            var useThisLine = true;
            var line = fullData[i];
            for(var filterKey in currentFilters){
                var testVal = line[filterKey];
                if(testVal != undefined){
                    testVal = testVal.toLowerCase();
                    var filterVal = currentFilters[filterKey].toLowerCase();

                    if(testVal.indexOf(filterVal) == -1){
                        useThisLine = false;
                    }

                }
            }
            if(useThisLine) sorted.push(line);
        }

        for(var sorting in currentSortMap){
            var dir = currentSortMap[sorting];

            if(dir == "asc") dir = -1;
            else dir = 1;

            if(alphaFields[sorting]){
                sorted.sort(function(a,b){
                    var valA = a[sorting];
                    var valB = b[sorting]
                    if(valA == undefined) valA = "";
                    if(valB == undefined) valB = "";
                    valA = valA.toString().toUpperCase();
                    valB = valB.toString().toUpperCase();
                    return dir * strcmp(valA,valB);
                });
            } else {
                sorted.sort(function(a,b){
                    var valA = a[sorting];
                    var valB = b[sorting]
                    if(valA == undefined) valA = 0;
                    if(valB == undefined) valB = 0;
                   // log(valA +" vs "+valB);
                    return dir * (valA-valB);
                });
            }

        }




        callback(sorted);
    }
}














function mixgrowClientRemoteSorting(id){



    this.runDataQuery = function(callback,currentOffset,currentFilters,currentSortMap){
        var query = optimizationQuery(currentOffset,currentFilters,currentSortMap);
        jQuery.getJSON(query,callback);
    }
    this.runTallyQuery = function(callback,filterMap){
        var query = optimizationTallyQuery(filterMap);
        jQuery.getJSON(query,callback);
    }
//return a custom function for this page, that takes in
//a currentOffset (how many parent rows have been returned,
//a map of fields to sort on (sort field mapped to "asc" or "desc"

    var optimizationQuery = function(currentOffset, filterMap, sortMap){
        var url = "/loadCampaign/"+id+"/sites";
        url += "?offset="+currentOffset +"&count="+10;

        for(var sortField in sortMap){
            url += "&sortField="+sortField+"&sortOrder="+sortMap[sortField];
        }
        for(var filterField in filterMap){
            url += "&"+filterField+"="+filterMap[filterField];
        }
        return url;

    }
    var optimizationTallyQuery = function(filterMap){
        var url = "/loadCampaign/"+id+"/sitesTally";
        var sep = "?"
        for(var filterField in filterMap){
            url += sep+filterField+"="+filterMap[filterField];
            sep = "&";
        }
        return url;

    }

    this.getSummaryMessage = function(totalRecordsDisplayed, recordsDisplayedByType,totalRecordsToDisplay){
        if(totalRecordsToDisplay != undefined){
            return "Showing "+recordsDisplayedByType['sites']+" sites out of "+totalRecordsToDisplay;
        } else {
            return "Showing "+recordsDisplayedByType['sites']+
                " sites ("+recordsDisplayedByType['placements']+" spots) total "+totalRecordsDisplayed;
        }
    }



}



