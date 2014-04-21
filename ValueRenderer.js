/**
 * ValueRenderer Service
 */
angular.module("mm.datatable.core")
    .service("ValueRenderer",["$filter", "Utilities", function($filter, Utilities){


        /**
         * @module Cell value renderers - intended for use with datatable mRender column property.
         * @see http://datatables.net/ref - Datatables mRender documentation
         * @see http://docs.angularjs.org/api/ng/filter - AngularJs filter documentation
         */
        return {

            /**
             * Configures renderer function.  Renders cell value as currency.
             * @param symbol
             * @param ignoreEmptyValue true = leaves empty or undefined values as blank, false = renders as 0.00
             * @returns {Function}
             */
            currencyRenderer: function(symbol, ignoreEmptyValue){
                symbol = symbol || "$";
                ignoreEmptyValue = (typeof ignoreEmptyValue === "undefined") || ignoreEmptyValue;
                var filterFn = $filter("currency");
                var rendererFn = function(data){
                    if(data === "" || data === null) {
                        if(ignoreEmptyValue){
                            if(data == null) {
                                return "";
                            } else {
                                return data;
                            }
                        }
                        return filterFn(0.0, symbol);
                    }
                    return filterFn(data, symbol);
                };
                return rendererFn;
            },

            /**
             * Converts microCurrency into currency with the correct formatting and symbol
             * @param symbol
             * @param ignoreEmptyValue
             * @returns {Function}
             */
            microCurrencyRenderer: function(symbol, ignoreEmptyValue) {
                var _this = this;
                return function(data) {
                    var convertedValue = Utilities.isNotEmptyValue(data) ? parseFloat(data) / (1000000) : data;
                    var filterFn = _this.currencyRenderer(symbol, ignoreEmptyValue);
                    return filterFn(convertedValue);
                };
            },

            /**
             * Configures renderer function.  Renders cell value as percentage
             * @param precision
             * @param ignoreEmptyValue true = leaves empty or undefined values as blank, false = renders as 0.0%
             * @returns {Function}
             */
            percentRenderer: function(precision, ignoreEmptyValue) {
                precision = precision || 2;
                ignoreEmptyValue = (typeof ignoreEmptyValue === "undefined") || ignoreEmptyValue;

                var filterFn = $filter("number");
                var rendererFn = function(data){
                    if(data === "" || data === null) {
                        if(ignoreEmptyValue){
                            if(data == null) {
                                return "";
                            } else {
                                return data;
                            }
                        }
                        return filterFn(0.0, precision) + "%";
                    }
                    return filterFn(data, precision) + "%";
                };
                return rendererFn;
            },

            /**
             * Configures renderer function.  Renders cell value as date.
             * @param format
             * @returns {Function}
             */
            dateRenderer: function(format){
                format = format || "MM/dd/yyyy";
                var filterFn = $filter("date");
                var rendererFn = function(data){
                    if(data === "" || data === null) {
                        if(data == null) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                    return filterFn(data, format);
                };
                return rendererFn;
            },

            /**
             * Configures renderer function.  Renders cell value as number.
             * @param precision
             * @param ignoreEmptyValue true = leaves empty or undefined values as blank, false = renders as zero
             * @returns {Function}
             */
            numberRenderer: function(precision, ignoreEmptyValue){
                precision = precision || 0;
                ignoreEmptyValue = (typeof ignoreEmptyValue === "undefined") || ignoreEmptyValue;
                var filterFn = $filter("number");
                var rendererFn = function(data){
                    if(data === "" || data === null) {
                        if(ignoreEmptyValue){
                            if(data == null) {
                                return "";
                            } else {
                                return data;
                            }
                        }
                        return filterFn(0, precision);
                    }
                    return filterFn(data, precision);
                };
                return rendererFn;
            },

            /**
             * Configures renderer function.  Renders cell value as lowercase string.
             * @returns {Function}
             */
            lowercaseRenderer: function(){
                var filterFn = $filter("lowercase");
                var rendererFn = function(data){
                    if(data === "" || null) {
                        if(data == null) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                    return filterFn(data);
                };
                return rendererFn;
            },

            /**
             * Configures renderer function.  Renders cell value as uppercase string.
             * @returns {Function}
             */
            uppercaseRenderer: function(){
                var filterFn = $filter("uppercase");
                var rendererFn = function(data){
                    if(data === "" || data === null) {
                        if(data == null) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                    return filterFn(data);
                };
                return rendererFn;
            },

            /**
             * Configures renderer function.  Renders cell value as character-length limited text.
             * @param length
             * @returns {Function}
             */
            limitRenderer: function(length){
                length = length || 100;
                var filterFn = $filter("limitTo");
                var rendererFn = function(data){
                    if(data === "" || data == null) {
                        if(data == null) {
                            return "";
                        } else {
                            return data;
                        }
                    }
                    return filterFn(data, length);
                };
                return rendererFn;
            }

        };

    }]);