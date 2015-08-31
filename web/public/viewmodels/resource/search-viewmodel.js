//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------
//  SearchViewModel
//
BD2K.Resource.SearchViewModel = function(options){
    var self = this;

    this.onCheck = function(eventObj) { self._onCheck(self, $(this), eventObj); };
    this.onTag = function(eventObj){ self._onTag(self, $(this), eventObj); };
    this.onPageClick = function (eventObj) { return self._onPageClick(self, $(this), eventObj); };
    this.onNumPerPageClick = function (eventObj) { return self._onNumPerPageClick(self, $(this), eventObj); };
    this.onMenuClick = function (eventObj) { return self._onMenuClick(self, $(this), eventObj); };
    this.onMenuCheckClick = function (eventObj) { return self._onMenuCheckClick(self, $(this), eventObj); };
    this.onSearchButtonClick = function (eventObj) { return self._onSearchButtonClick(self, $(this), eventObj); };
    this.onAdvancedSearchClick = function (eventObj) { return self._onAdvancedSearchClick(self, $(this), eventObj); };
    this.onSubDropClick = function (eventObj) { return self._onSubDropClick(self, $(this), eventObj); };
    this.onRemoveSearch = function (eventObj) { return self._onRemoveSearch(self, $(this), eventObj); };
    this.onRemoveRefinement = function (eventObj) { return self._onRemoveRefinement(self, $(this), eventObj); };
    this.onType = function (eventObj) { return self._onType(self, $(this), eventObj); };

    $('.checkbox input').change(self.onCheck);
    $('.tag button').click(self.onTag);
    $('.actualPagination a').click(self.onPageClick);
    $('.numPages a').click(self.onNumPerPageClick);
    $('.dropdown-menu a[data-filter]').click(self.onMenuClick);
    $('.dropdown-menu a[data-check]').click(self.onMenuCheckClick);
    $('#searchHistory .badge').click(self.onRemoveSearch);
    $('#refinements .badge').click(self.onRemoveRefinement);
    $('.onTypeClick').click(self.onType);
    this._options = options;
    this._placeHolderMap = options.placeHolderMap;

    this._placeHolderMap.Search = "resource";
    this._placeHolderMap.Subsearch = "resource";

    $("#submitForm input").keypress(function (e) {
        if (e.which == 13) {
            self.onSearchButtonClick(e);
        }
    });
    $("#submitForm button").click(self.onSearchButtonClick);
    $("#submitForm button").submit(function(){ return false;});

    $(".dropdown-submenu-hide a").click(self.onSubDropClick);

    $('html').click(function() {
       $(".dropdown-submenu-show > a").each(function() {
           var caller = $(this);
           var level = parseInt(caller.parent().attr("data-level"));
           caller.parent().removeClass("dropdown-submenu-show").addClass("dropdown-submenu-hide");
           var dataLevel = '[data-level="' + (level+1).toString() + '"]';
           var nextUntil = '[data-level="' + (level).toString() + '"]';
           var toHide = caller.parent().nextUntil(nextUntil);
           toHide.filter(".dropdown-submenu-show").removeClass("dropdown-submenu-show").addClass("dropdown-submenu-hide");
           toHide.hide();
        });
    });

    $('#btnSearch').click(self.onAdvancedSearchClick);
};

//--- onMenuCheckClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onMenuCheckClick = function (self, caller, eventObj) {
    var icon = caller.find("i");
    if (icon.hasClass("invisible")) {
        icon.removeClass("invisible");
        $("#submitForm").find('[placeholder="Search"]').attr("placeholder", "Subsearch");
    }
    else {
        icon.addClass("invisible");
        $("#submitForm").find('[placeholder="Subsearch"]').attr("placeholder", "Search");
    }

    return false;
};

//--- onSubDropClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onSubDropClick = function (self, caller, data) {
    var level = parseInt(caller.parent().attr("data-level"));
    if (caller.parent().hasClass("dropdown-submenu-hide")) {
        caller.parent().removeClass("dropdown-submenu-hide").addClass("dropdown-submenu-show");
        var dataLevel = '[data-level="' + (level+1).toString() + '"]';
        var toShow = caller.parent().nextUntil(":visible").filter(dataLevel);
        toShow.show();
    }
    else {
        caller.parent().removeClass("dropdown-submenu-show").addClass("dropdown-submenu-hide");
        var dataLevel = '[data-level="' + (level+1).toString() + '"]';
        var nextUntil = '[data-level="' + (level).toString() + '"]';
        var toHide = caller.parent().nextUntil(nextUntil);
        toHide.filter(".dropdown-submenu-show").removeClass("dropdown-submenu-show").addClass("dropdown-submenu-hide");
        toHide.hide();
    }

    return false;
};

//--- onAdvancedSearchClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onAdvancedSearchClick = function (self, caller, data) {

    var parent = $("#divMenu");
    var rows = parent.find(".row");

    var placeToFilter = self._placeHolderMap;

    var searchFilters = {};

    rows.each(function() {
        var row = $(this);
        var input = row.find("input");
        var val = input.val();
        var placeHolder = input.attr("placeholder");

        var filter = placeToFilter[placeHolder];
        searchFilters[filter] = val;
    });

    var strict = self._options.strict;
    var page = self._options.page;
    var perPage = self._options.perPage;
    var searchUuids = self._options.searchUuids;

    var obj = {};
    var stringify = {};
    stringify.searchFilters = searchFilters;
    stringify.strict = strict;
    stringify.page = page;
    stringify.perPage = perPage;
    stringify.searchUuids = searchUuids;
    stringify.sub = !parent.find("#lnkSub").find("i").hasClass("invisible");
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- searchRequest ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._searchRequest = function (self, caller, eventObj) {

    var parent = $("#divMenu");
    var input = $("#query");
    var filtersText = input.val();
    var placeHolder = input.attr("placeholder");

    var filters = {};

    var key = placeHolder == "Search" || placeHolder == "Subsearch" ? "resource" : $('[data-place="' + placeHolder + '"]').attr("data-filter");

    filters[key] = filtersText;

    var obj = {};
    var stringify = {};
    stringify.searchFilters = filters;
    stringify.strict = {};
    stringify.page = 1;
    if(!parent.find("#lnkSub").find("i").hasClass("invisible")){
        stringify.sub = true;
        stringify.strict = self._options.strict;
    }

    stringify.searchUuids = self._options.searchUuids;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");

};

//--- onSearchButtonClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onSearchButtonClick = function (self, caller, eventObj) {

    caller = $("#searchButton");
    if (caller.find("i").hasClass("fa-search")) { return self._searchRequest(self, caller, eventObj); }

    var row = caller.closest(".row");
    var parent = $("#divMenu");
    var rows = parent.find(".row");
    var count = rows.length;
    var index = rows.index(row);

    if (index == 0) {
        for (var i=0; i<count-2; i++){
            var curRow = rows.eq(i);
            var nextRow = rows.eq(i+1);
            var nextRowPlace = nextRow.find("input").attr("placeholder");
            curRow.find("input").attr("placeholder", nextRowPlace);
        }
        rows.eq(count-2).remove();
    }
    else {
        row.remove();
    }

    if (count == 3){
        var first = rows.first();
        first.find("button i").removeClass("fa-times").addClass("fa-search");
        var last = rows.last();
        last.addClass("hidden");
        parent.find(".dropdown").first().removeClass("open");
        parent.find(".dropdown").last().children().detach().appendTo(parent.find(".dropdown").first());
    }

    if (count > 3){
        parent.find(".row").eq(1).css("margin-top", "-18px");
    }

    eventObj.preventDefault();
    eventObj.stopPropagation();
    eventObj.stopImmediatePropagation();
    return false;
};

//--- onMenuClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onMenuClick = function (self, caller, eventObj) {

    var parent = $("#divMenu");
    var firstRow = parent.find(".row").first();
    var filter = caller.attr("data-filter");
    var place = caller.attr("data-place");

    var firstPlace = firstRow.find("input").attr("placeholder");

    if (firstPlace == "Search" || firstPlace == "Subsearch") {
        firstRow.find("input").attr("placeholder", place);
    }
    else if(parent.find(".hidden").length > 0){
        var html = [
            '<div class="row" style="margin-top:-18px">',
                '<div class="col-lg-2 vcenter" style="opacity: 1.0">',
                '</div>',
                '<div class="col-lg-7 vcenter">',
                    '<div class="input-group">',
                        '<input type="text" class="form-control" placeholder="Search">',
                        '<span class="input-group-btn">',
                            '<button class="btn btn-default" type="button">',
                            '<i class="fa fa-times"></i>',
                            '</button>',
                        '</span>',
                    '</div>',
                '</div>',
                '<div class="col-lg-2 vcenter">',
                '</div>',
            '</div>'
        ].join('\n');

        firstRow.after(html);
        firstRow.next().find("button").click(self.onSearchButtonClick);
        firstRow.find("button i").removeClass("fa-search").addClass("fa-times");
        firstRow.find("button").click(self.onSearchButtonClick);
        parent.find(".dropdown").first().children().detach().appendTo(parent.find(".dropdown").last());

        firstRow = parent.find(".row").last().prev().find("input").attr("placeholder", place);
        parent.find(".hidden").removeClass("hidden");
    }
    else {
        var html = [
            '<div class="row" style="margin-top:15px">',
                '<div class="col-lg-2 vcenter" style="opacity: 1.0">',
                '</div>',
                '<div class="col-lg-7 vcenter">',
                    '<div class="input-group">',
                        '<input type="text" class="form-control" placeholder="Search">',
                        '<span class="input-group-btn">',
                            '<button class="btn btn-default" type="button">',
                            '<i class="fa fa-times"></i>',
                            '</button>',
                        '</span>',
                    '</div>',
                '</div>',
                '<div class="col-lg-2 vcenter">',
                '</div>',
            '</div>'
        ].join('\n');

        var lastInputRow = parent.find(".row").last().prev();

        lastInputRow.after(html);
        lastInputRow.next().find("button").click(self.onSearchButtonClick);
        lastInputRow.next().find("input").attr("placeholder", place);
    }
};

//--- onPageClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onPageClick = function (self, caller, eventObj) {

    var searchFilters = self._options.searchFilters;
    var strict = self._options.strict;
    var page = self._options.page;
    var perPage = self._options.perPage;
    var searchUuids = self._options.searchUuids;

    var li = caller.closest("li");
    if (li.hasClass("active") || li.hasClass("disabled")) { return false; }

    if (caller.is("[aria-label]")) {
        var intPage = parseInt(page);
        page =  caller.attr("aria-label") == "Previous" ? (intPage - 1).toString() : (intPage + 1).toString();
    }
    else
    {
        page = caller.text();
    }

    var obj = {};
    var stringify = {};
    stringify.searchFilters = searchFilters;
    stringify.strict = strict;
    stringify.page = page;
    stringify.perPage = perPage;
    stringify.searchUuids = searchUuids;
    stringify.sub = self._options.sub;
    stringify.back = true;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onNumPerPageClick ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onNumPerPageClick = function (self, caller, eventObj) {

    var searchFilters = self._options.searchFilters;
    var strict = self._options.strict;
    var page = 1;
    var searchUuids = self._options.searchUuids;

    var li = caller.closest("li");
    if (li.hasClass("active") || li.hasClass("disabled")) { return false; }

    var perPage = caller.text();

    var obj = {};
    var stringify = {};
    stringify.searchFilters = searchFilters;
    stringify.strict = strict;
    stringify.page = page;
    stringify.perPage = perPage;
    stringify.sub = self._options.sub;
    stringify.back = true;
    stringify.searchUuids = searchUuids;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onCheck ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onCheck = function (self, caller, eventObj) {

    var raw = caller.closest("[data-raw]").attr("data-raw");
    var val = caller.siblings("span").first().text();
    var searchFilters = self._options.searchFilters;
    var searchUuids = self._options.searchUuids;
    var strict = self._options.strict;

    var checked = caller[0].checked;

    if (checked) {
        strict[raw] = strict[raw] || {};
        strict[raw][val] = true;
    }
    else {
        delete strict[raw][val];
        if (BD2K.count(strict[raw]) == 0) { delete strict[raw]; }
    }

    var obj = {};
    var stringify = {};
    stringify.searchFilters = searchFilters;
    stringify.strict = strict;
    stringify.sub = self._options.sub;
    stringify.back = true;
    stringify.searchUuids = searchUuids;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onTag ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onTag = function (self, caller, eventObj) {
    var tag = caller.text().trim();

    var obj = {};
    var stringify = {};

    var searchFilters = {};
    searchFilters["tags"] = tag;

    if(!parent.find("#lnkSub").find("i").hasClass("invisible")){
        stringify.sub = true;
        stringify.strict = self._options.strict;

    }
    else{
        stringify.sub = false;
        stringify.strict = {};
    }

    stringify.searchFilters = searchFilters;
    stringify.page = 1;
    stringify.perPage = self._options.perPage;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onRemoveRefinements ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onRemoveRefinement = function (self, caller, eventObj) {

    var raw = caller.parent().find("span").find("b").text().toLowerCase();
    var val = caller.parent().find("span").text();
    val = val.substr(val.indexOf(":") + 1).trim()
    var searchFilters = self._options.searchFilters;
    var searchUuids = self._options.searchUuids;
    var strict = self._options.strict;

    delete strict[raw][val];
    if (BD2K.count(strict[raw]) == 0) { delete strict[raw]; }

    var obj = {};
    var stringify = {};
    stringify.searchFilters = searchFilters;
    stringify.strict = strict;
    stringify.sub = self._options.sub;
    stringify.back = true;
    stringify.searchUuids = searchUuids;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onTag ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onTag = function (self, caller, eventObj) {
    var tag = caller.text().trim();

    var obj = {};
    var stringify = {};

    var searchFilters = {};
    searchFilters["tags"] = tag;

    if($("#lnkSub").find("i").attr("class").indexOf("invisible") > 0)
        stringify.sub = false;
    else
        stringify.sub = true;
    stringify.searchFilters = searchFilters;
    stringify.strict = self._options.strict;
    stringify.page = 1;
    stringify.perPage = self._options.perPage;
    stringify.searchUuids = self._options.searchUuids;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onRemoveSearch ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onRemoveSearch = function (self, caller, eventObj) {
    var stringify = self._options;
    var obj = {};
    if(caller.parent().attr("data-key")){
        var index = stringify.searchUuids.indexOf(caller.parent().attr("data-key"));
        stringify.searchUuids.splice(index, 1);
    }
    //if(caller.parent().attr("id") === "curSearch"){
    stringify.back = true;
    //}
    stringify.sub = true;
    if(stringify.searchUuids.length === 0){
        stringify.searchFilters = {"resource":""};
    }
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
};

//--- onType ------------------------------------------------------------------------------
BD2K.Resource.SearchViewModel.prototype._onType = function onType(self, caller, eventObj) {
    var type = caller.find("b").text();

    var searchFilters = self._options.searchFilters;
    var searchUuids = self._options.searchUuids;
    var strict = self._options.strict;

    var checked = caller[0].checked;

    var obj = {};
    var stringify = {};
    stringify.searchFilters = searchFilters;
    var obj = {};
    obj[type] = true;
    strict.type = obj;
    stringify.strict = strict;
    stringify.sub = self._options.sub;
    stringify.back = true;
    stringify.searchUuids = searchUuids;
    obj.input = JSON.stringify(stringify);
    BD2K.request("/resource/search", obj, "GET");
}