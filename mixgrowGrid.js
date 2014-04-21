
/*
TODO:

* filter
* checkbox select

* min width for cols???
* custom classes for
* write it up
DONE:
 * basic dataload
 * load with hierarchy
 * scrolling paging
 * loading notification
 * movable header
 * per row classes
 * tally row
 * -tally place
 * -call back w/ different record types
 * sort
 *
 * GENERAL ISSUES:
 * are we building the selects based on what's ever been there, or what?
 */

var  mixgrowGrid = new function(){ //in this pattern, "var"s are private, and "this." will be public
    var init;
    var jqoDataTable, jqoHeaderTable, jqoWrapper, jqoFooterWrapper, jqoEditbox;
    var jqoScrollTrigger;
    var jqoLoadingIndicator;
    var noMoreToLoad = false;
    var currentOffset = 0;
    var rowcountsByType = {};
    var orderableDefault = false;

    var currentSortField;
    var currentSortOrder;

    var currentFilters = {};

    var uniqueValuesForKeys = {};


    this.initializeGrid = function(argInit){
        init = argInit;


        if(init.hierarchy == undefined) { //no hierarchy is a one level hierarchy
            init.hierarchy = [""];
            init.columns = {"":init.columns};
        }
        init.rowClasses = (init.rowClasses == undefined)?{}:init.rowClasses;


        if(init.orderable != undefined){
            orderableDefault = init.orderable;
        }

        if(init.sorting != undefined){
            currentSortField = init.sorting.initialSortField;
            currentSortOrder = "desc";
        }


        initializeTable(init.location);
        startNewQuery();
    }


    var initializeTable = function(selector){
        var jqoSpot =  jQuery(selector);
        if(jqoSpot.length == 0) {
            err("Could not find "+selector+" on page");
            return;
        }
        jqoWrapper = jQuery("<div class='mixgrowGrid'></div>");
        jqoSpot.append(jqoWrapper);

        jqoHeaderTable = jQuery("<table class='mixgrowGrid_header'></table>");
        jqoWrapper.append(jqoHeaderTable);

        buildHeader();


        jqoDataTable = jQuery("<table class='mixgrowGrid_data'></table>");
        jqoWrapper.append(jqoDataTable);

        jqoScrollTrigger = jQuery("<div class='mixgrowGrid_scrollTrigger'></div>");
        jqoWrapper.append(jqoScrollTrigger);

        jqoFooterWrapper = jQuery("<div class='mixgrowGrid_showingMessage'></div>");
        jqoWrapper.append(jqoFooterWrapper);


        jqoEditbox = jQuery("<div class='editbox'></div>");
        jqoWrapper.append(jqoEditbox);

        if(init.selectorForLoadingIndicator) jqoLoadingIndicator = jQuery(init.selectorForLoadingIndicator)
        else {
            jqoLoadingIndicator = jQuery("<div>Loading...</div>");
            jqoSpot.append(jqoLoadingIndicator);
        }

        jQuery(window).scroll(handleScrollAndResize).resize(handleScrollAndResize);



    }

    var startNewQuery = function(){
        jqoWrapper.addClass("fadeTo50");
        jqoFooterWrapper.hide();

        noMoreToLoad = false;
        currentOffset = 0;
        rowcountsByType = {};
        uniqueValuesForKeys = {};
        loadNextDataSet(true);
        loadTallyRow();
    }

    var handleScrollAndResize = function(){
        checkForInfiniteScroll();
        adjustHeaderWidths();
        adjustHeaderLocation();
        adjustFooterLocation();
    }

    var checkForInfiniteScroll = function(){
        if(isTriggerScrolledIntoView()){
            if(!noMoreToLoad){
                loadNextDataSet();
            }
        }
    }

    //move the header table so it's either at the top of the table or the top of the window
    var adjustHeaderLocation = function(){
        var eTop = jqoWrapper.offset().top; //get the offset top of the element
        var scrollTop = - jQuery(window).scrollTop();
        var newOffset =  -(scrollTop + eTop);
        if(newOffset < 0) newOffset = 0;
        jqoHeaderTable.css("top",newOffset+"px");
    }

    //move the header table so it's either at the top of the table or the top of the window
    var adjustFooterLocation = function(){
        var eTop = jqoWrapper.offset().top;
        var eHeight = jqoWrapper.height();
        var scrollTop = - jQuery(window).scrollTop();
        var scrollBottom = -scrollTop + jQuery(window).height();

        var newOffset =  (eTop +eHeight) - scrollBottom ;

        jqoFooterWrapper.removeClass("isUnder isOver");
        if(newOffset < 0) {
            newOffset = 0;
            jqoFooterWrapper.addClass("isUnder");
        } else {
            jqoFooterWrapper.addClass("isOver");
        }
        jqoFooterWrapper.css("bottom",newOffset + "px");
    }

    var isTriggerScrolledIntoView = function(){
        var docViewTop = jQuery(window).scrollTop();
        var docViewBottom = docViewTop + jQuery(window).height();

        var elemTop = jQuery(jqoScrollTrigger).offset().top;
        var elemBottom = elemTop + jQuery(jqoScrollTrigger).height();

        return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
            && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
    }

    var loadNextDataSet = function(removeOldData){
        jqoLoadingIndicator.show();
        jQuery.getJSON(buildQuery(),function(data){receiveData(removeOldData,data);});
    }


    var buildQuery = function(){
        var url = init.url;
        url += "?offset="+currentOffset +"&count="+ init.recordsPerLoad;

        if(currentSortField != undefined){
            url += "&sortField="+currentSortField+"&sortOrder="+currentSortOrder;
        }

        url += buildQueryGetFilters("&");

        return url;
    }

    var buildQueryGetFilters = function(sep){
        var buf = "";

        for(var filter in currentFilters){
            buf += sep+filter+"="+currentFilters[filter];
            sep = "&";
        }
        return buf;
    }



    var receiveData = function(removeOldData, data){

        if(removeOldData){
            jqoDataTable.empty();
        }
        jqoWrapper.removeClass("fadeTo50");

        jqoLoadingIndicator.show();
        currentOffset += data.length;
        //assume that receiving an array of length 0 means we have downloaded everything
        if(data.length == 0) noMoreToLoad = true;

        for(var i = 0; i < data.length; i++){
            var topLevelRowData = data[i];
            appendDataRow(0,topLevelRowData);
        }
        
        updateSummaryMessage();
        jqoHeaderTable.show();
        adjustHeaderWidths();
        adjustFooterLocation();

        if(!noMoreToLoad) checkForInfiniteScroll();
    }

    var updateSummaryMessage = function(){
        if(init.summaryMessageCallback != undefined){
            var sum = 0;
            for(var key in rowcountsByType){
                sum += rowcountsByType[key];
            }

            jqoFooterWrapper.html(init.summaryMessageCallback(sum,rowcountsByType)).css("display","inline-block");
        } else {
            jqoFooterWrapper.hide();
        }
    }
    
    
    var loadTallyRow = function(){
        if(init.tallyurl != undefined) jQuery.getJSON(init.tallyurl + buildQueryGetFilters("?"),receiveTallyData);
    }

    var receiveTallyData = function(data){
        var rowType = init.hierarchy[0]; //for now we are assuming tally row is same col desc as topmost row in hierarchy
        var colDetails = init.columns[rowType];

        jqoHeaderTable.find(".tally").remove(); //remove all the old tally rows
        buildAndAppendRow(jqoHeaderTable,colDetails,data,"tally",false);
        adjustHeaderWidths();
    }


    var appendDataRow = function(depth,rowdata){
        var rowType = init.hierarchy[depth];
        var colDetails = init.columns[rowType];

        incrementTotalInMap(rowcountsByType,rowType);

        var rowClass = (init.rowClasses[rowType] == undefined)?"":init.rowClasses[rowType];

        buildAndAppendRow(jqoDataTable,colDetails,rowdata,rowClass,depth==0);

        //look to see if we have children in the hierarchy, and if we have data for that kind of child
        if(depth + 1 < init.hierarchy.length){
            var childrenKey = init.hierarchy[depth + 1];
            var childrenValues = rowdata[childrenKey];
            if(childrenValues != undefined){
                for(var j = 0; j < childrenValues.length; j++){
                    appendDataRow(depth + 1, childrenValues[j]);
                }
            }
        }
    }

    var incrementTotalInMap = function(map,key){
        if(map[key] == undefined) map[key] = 0;
        map[key]++;
    }

    var buildAndAppendRow = function(jqoTable,colDetails,rowdata,rowclass,isTopLevel){
        var jqoRow = jQuery("<tr></tr>");
        for(var i = 0; i < colDetails.length; i++){
            var thisCol = colDetails[i]; //column descriptor
            var fieldName = thisCol.data; //find the key for this column
            var value = rowdata[fieldName]; //lookup value

            if(isTopLevel && thisCol.filter == "select"){
                log("something for "+thisCol.data);
                addValueToMapOfSets(uniqueValuesForKeys,thisCol.data,value);
            }


            var renderer = thisCol.render;
            if(thisCol.render){
                value = thisCol.render(value);
            }

            if(value == undefined) {
                //err("no "+fieldName+" for type "+ rowType);
                value = "";
            }
            var jqoCol = jQuery("<td></td>");
            jqoCol.html(value);

            if(thisCol.colspan != undefined) jqoCol.attr("colspan",thisCol.colspan);

            jqoRow.append(jqoCol);
        }
        if(rowclass != undefined) jqoRow.addClass(rowclass);
        jqoTable.append(jqoRow);
    }

    var addValueToMapOfSets = function(map,whichSet,value){
        if(map[whichSet] == undefined) map[whichSet] = {};
        map[whichSet][value] = true;
    }

    var buildHeader = function(){
        var rowType = init.hierarchy[0]; //this is hardcoded assuming top level
        var colDetails = init.columns[rowType];
        buildHeaderRow(colDetails);

    }
    var buildHeaderRow = function(colDetails){
        var jqoRow = jQuery("<tr></tr>");
        for(var i = 0; i < colDetails.length; i++){
            var thisCol = colDetails[i];
            var caption = thisCol.headerLabel;
            caption = (caption==undefined)?"":caption;

            //we are builing a little table here, rather than worying about floats and wrapping and what not
            //the table will safely hold filter and sorting icons

            var gutsTable = jQuery("<table width='100%'></table>");
            var gutsRow = jQuery("<tr></tr>");
            gutsTable.append(gutsRow);

            if(thisCol.filter != undefined){
                var filterHolder = jQuery("<td width='16'><div class='filterHolder'></div></td>");
                filterHolder.data("filterfield",thisCol.data);
                filterHolder.data("filtertype",thisCol.filter);
                jQuery(filterHolder).click(
                    handleFilterClick
                );
                gutsRow.append(filterHolder);

            }


            gutsRow.append("<td>"+caption+"</td>");

            var orderable = (thisCol.orderable == undefined)?orderableDefault:thisCol.orderable;

            if(orderable){
                var sortHolder = jQuery("<td width='19'><div class='sortHolder'></div></td>");

                if(currentSortField == thisCol.data){
                    sortHolder.addClass(currentSortOrder);
                }

                gutsRow.append(sortHolder);
                sortHolder.data("sortfield",thisCol.data);
                jQuery(sortHolder).click(
                    handleSortClick
                );
            }

            var jqoCol = jQuery("<td></td>");

            if(thisCol.colspan != undefined) jqoCol.attr("colspan",thisCol.colspan);
            jqoCol.append(gutsTable);
            jqoRow.append(jqoCol);

        }
        jqoHeaderTable.append(jqoRow);

    }

    var handleSortClick = function(){
        var jqo = jQuery(this);
        var sortField = jqo.data("sortfield");
        log("got sortfield "+sortField);


        jqoHeaderTable.find("td").removeClass("asc desc");
        var sortOrder;

        if(sortField == currentSortField){
             sortOrder = (currentSortOrder=="asc")?"desc":"asc";
        } else {
            sortOrder = "asc";
        }
        currentSortField = sortField;
        currentSortOrder = sortOrder;
        jqo.addClass(sortOrder);
        startNewQuery();

    }


    var handleFilterClick = function(){
        var jqo = jQuery(this);
        var filterField = jqo.data("filterfield");
        var filterType = jqo.data("filtertype");

        var jqoTargetArea = jqo.parents("table").parents("td");

        jqoEditbox.css("left",jqoTargetArea.offset().left+"px");
        jqoEditbox.css("top",jqoTargetArea.offset().height+"px");

        jqoEditbox.empty();

        jqoEditbox.data("field",filterField);

        jqoEditbox.data("clickedArea",jqo);


        if(filterType == "text"){
            jqoEditbox.append("<input class='input' />");
        }
        if(filterType == "select"){
            var select = jQuery("<select class='input'></select>");

            var seenValues = uniqueValuesForKeys[filterField];
            for(var val in seenValues){
                select.append("<option>"+val+"</option>");
            }


            jqoEditbox.append(select);
        }

        var jqoButtonOk = jQuery("<button>&#10003;</button>");
        jqoButtonOk.click(handleButtonOk);

        var jqoButtonX = jQuery("<button>&#65794;</button>");
        jqoButtonX.click(handleButtonX);

        jqoEditbox.append(jqoButtonOk);
        jqoEditbox.append(jqoButtonX);

        jqoEditbox.show();
    }

    var handleButtonOk = function(){
        var field = jqoEditbox.data("field");
        var value = jqoEditbox.find(".input").val();

        log("!!"+jqoEditbox.html());

        currentFilters[field]=value;

        startNewQuery();
        jqoEditbox.hide();

        var jqoClickzone = jqoEditbox.data("clickedArea");
        jqoClickzone.addClass("on");

    }
    var handleButtonX = function(){
        var field = jqoEditbox.data("field");
        delete(currentFilters[field])
        startNewQuery();
        jqoEditbox.hide();
        var jqoClickzone = jqoEditbox.data("clickedArea");
        jqoClickzone.removeClass("on");

    }


    var adjustHeaderWidths = function(){
        var jqoTableRows = jqoDataTable.find("tr");
        if(jqoTableRows.length == 0) return; //nothing to do I guess
        var jqoTableRow = jQuery(jqoTableRows[0]);
        var jqoTableCols = jqoTableRow.find("td");

        var jqoHeaderCols = jqoHeaderTable.find("tr").children();

        for(var i = 0; i < jqoTableCols.length; i++){
            var jqoTableCol = jQuery(jqoTableCols[i]);
            var jqoHeaderCol = jQuery(jqoHeaderCols.get(i));

            var w = jqoTableCol.outerWidth() + "px";
            jQuery(jqoHeaderCol).css("width",w).css("max-width",w).css("min-width",w);

            if(jqoTableCol.outerWidth() < jqoHeaderCol.outerWidth()){ //sometimes header might be wider because tally data
                var w = jqoHeaderCol.outerWidth() + "px";
                jQuery(jqoTableCol).css("width",w).css("max-width",w).css("min-width",w);
            }
        }
    }


    var err = function(m){
        if(console && console.log){
            console.log("mixgrowGrid ERROR:"+m);
        }
    }

};




function log(o){
 if(console && console.log) console.log(o);
}
function logify(o){
    log(inspect(o));
}

function inspect(o){
 return JSON.stringify(o,null," ");
}