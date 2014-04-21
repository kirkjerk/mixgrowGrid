(function($){
    angular.module("mm.datatable.core")
        .service("Utilities", [function(){
            return {
                getFieldIndex: function(id, dtApi) {
                    var columns = dtApi.settings().toArray()[0].aoColumns;
                    for(var i in columns) {
                        if(columns[i].data === id) {
                            return i;
                        }
                    }
                    console.error("Column " + id + " does not exist");
                    return -1;
                },
                getTag: function(tagName, props) {
                    var tag = document.createElement(tagName);
                    if(props.hasOwnProperty("attrs")) {
                        angular.forEach(props.attrs, function(attr, key){
                            $(tag).attr(key, attr);
                        });
                    }
                    if(props.hasOwnProperty("styles")) {
                        angular.forEach(props.styles, function(style, key){
                            $(tag).css(key, style);
                        });
                    }
                    if(props.hasOwnProperty("html")) {
                        $(tag).html(props.html);
                    }

                    return tag;
                },
                convertEmptyValueToZero: function(value) {
                    if( typeof value === "undefined" || value === "" || value === null) {
                        return 0;
                    } else {
                        return value;
                    }
                },
                isNotEmptyValue: function(value) {
                    return !(typeof value === "undefined" || value === "" || value === null);
                },
                convertUnixTimestampToDate: function(dataSet, fieldsToConvert) {
                    var self = this;
                    angular.forEach(dataSet, function(entry){
                        angular.forEach(fieldsToConvert, function(key){
                            key = key.split(".");
                            while(key.length > 1) {
                                entry = entry[key.shift()];
                            }
                            key = key.shift();
                            entry[key] = self.isNotEmptyValue(entry[key]) ?
                                moment(entry[key], "X").toDate() : entry[key];
                        });
                    });

                    return dataSet;
                }
            };
        }]);
})(jQuery);