withAngularTests("Angular (UI Core)", function(runTest){

    /* -----[ utils ]----- */

    $.fn.press = function(key) {
        return this.trigger({ type: "keydown", keyCode: key } );
    };

    $.fn.type = function(value) {
        return this.val(value).each(function() {
            if (this.createTextRange) {
                var textRange = this.createTextRange();
                textRange.collapse(false);
                textRange.select();
            }
        });
    };

    /* -----[ initialization ]----- */

    runTest("create widgets", function(dom, $scope){
        var slider = $("<input kendo-slider />").appendTo(dom);
        var numericTextBox = $("<input kendo-numerictextbox />").appendTo(dom);
        var colorPicker = $("<input kendo-color-picker />").appendTo(dom);
        var grid = $("<div kendo-grid></div>").appendTo(dom);

        $scope.whenRendered(function(){
            start();
            ok(slider.data("kendoSlider") instanceof kendo.ui.Slider);
            ok(numericTextBox.data("kendoNumericTextBox") instanceof kendo.ui.NumericTextBox);
            ok(colorPicker.data("kendoColorPicker") instanceof kendo.ui.ColorPicker);
            if (kendo.ui.Grid) {
                ok(grid.data("kendoGrid") instanceof kendo.ui.Grid);
            }
        });
    });

    runTest("store widget reference in $scope", function(dom, $scope){
        $("<div kendo-window='window' k-title='\"Reference\"'></div>").appendTo(dom);
        expect(2);
        $scope.whenRendered(function(){
            ok($scope.window instanceof kendo.ui.Window);
            equal($scope.window.title(), "Reference");
            start();
        });
    });

    runTest("handle k-options", function(dom, $scope){
        var w1 = $("<div kendo-window k-options='windowOptions'></div>").appendTo(dom);
        var w2 = $("<div kendo-window k-title='windowOptions.title'></div>").appendTo(dom);
        expect(2);
        $scope.whenRendered(function(){
            w1 = w1.data("kendoWindow");
            w2 = w2.data("kendoWindow");
            equal(w1.title(), $scope.windowOptions.title);
            equal(w2.title(), $scope.windowOptions.title);
            start();
        });
    });

    runTest("handle unprefixed options", function(dom, $scope){
        var w = $("<div kendo-window options='windowOptions'></div>").appendTo(dom);
        expect(1);
        $scope.whenRendered(function(){
            equal(w.data("kendoWindow").title(), $scope.windowOptions.title);
            start();
        });
    });

    runTest("handle unprefixed on- options", function(dom, $scope){
        var theSwitch = $("<div kendo-mobileswitch on-label='onLabel'></div>").appendTo(dom);
        $scope.onLabel = "ONE"
        $scope.whenRendered(function(){
            equal(theSwitch.data("kendoMobileSwitch").options.onLabel, "ONE");
            start();
        });
    });

    runTest("handle widget data* options", function(dom, $scope){
        var ddl = $("<select kendo-dropdownlist data-source='foo' data-text-field='\"bar\"' data-value-field='\"foo\"'></select>").appendTo(dom);
        expect(3);

        $scope.foo = [
            { foo: "value", bar: "text" }
        ];

        $scope.whenRendered(function(){
            equal(ddl.find('option').attr("value"), "value");
            equal(ddl.find('option').text(), "text");
            equal(ddl.data('kendoDropDownList').options.dataValueField, 'foo');
            start();
        });
    });

    /* -----[ support for {{angular}} expressions in customizable templates ]----- */

    runTest("AutoComplete templates", function(dom, $scope){
        $scope.options = {
            dataSource: $scope.data,
            dataValueField: "id",
            dataTextField: "text",
            template: "| {{dataItem.text}} |",
        };
        var input = $("<input kendo-autocomplete='autocomplete' k-options='options' />").appendTo(dom);
        expect(2);
        $scope.whenRendered(function(){
            input.type("b");
            $scope.autocomplete.search();
            input.press(kendo.keys.DOWN);
            input.press(kendo.keys.ENTER);
            equal(input.val(), "Bar");
            equal($scope.autocomplete.ul.children(":first").text(), "| Bar |");
            start();
        });
    });

    runTest("ComboBox templates", function(dom, $scope){
        $scope.options = {
            dataSource: $scope.data,
            dataValueField: "id",
            dataTextField: "text",
            template: "| {{dataItem.text}} |",
        };
        var combo = $("<input kendo-combobox='combobox' k-options='options' />").appendTo(dom);
        expect(2);
        $scope.whenRendered(function(){
            $scope.combobox.open();
            var items = $scope.combobox.items();
            equal($(items[0]).text(), "| Foo |");
            equal($(items[1]).text(), "| Bar |");
            start();
        });
    });

    runTest("ListView templates", function(dom, $scope){
        $scope.options = {
            dataSource: $scope.data,
            template: "<span>{{dataItem.text}} {{dataItem.id}}</span>",
            altTemplate: "<span>{{dataItem.id}} {{dataItem.text}}</span>",
            editTemplate: "<div class='my-editable'>|{{dataItem.text}}|</div>",
            edit: function(e) {
                equal(e.item.text(), "|Foo|");
            }
        };
        $("<div kendo-listview='list' k-options='options'></div>").appendTo(dom);
        expect(3);
        $scope.whenRendered(function(){
            var items = $scope.list.items();
            equal(items.eq(0).text(), "Foo 1");
            equal(items.eq(1).text(), "2 Bar");
            $scope.list.edit(items.eq(0));
            start();
        });
    });

    runTest("DropDownList templates", function(dom, $scope){
        $scope.options = {
            dataSource: $scope.data,
            dataValueField: "id",
            template: "{{dataItem.text}} {{dataItem.id}}",
            valueTemplate: "{{dataItem.id}} {{dataItem.text}}",
        };
        var input = $("<select kendo-dropdownlist='list' k-options='options'></select>").appendTo(dom);
        expect(3);
        $scope.whenRendered(function(){
            var items = $scope.list.items();
            equal($(items[0]).text(), "Foo 1");
            equal($(items[1]).text(), "Bar 2");
            $scope.list.value(2);
            equal($scope.list.span.text(), "2 Bar");
            start();
        });
    });

    runTest("Menu + dataSource with {{angular}}", function(dom, $scope){
        $scope.options = {
            dataSource: [
                { text: "{{3 + 3}}", encoded: false }
            ]
        };
        $("<ul kendo-menu='menu' k-options='options'></ul>").appendTo(dom);
        expect(1);
        $scope.whenRendered(function(){
            equal($scope.menu.wrapper.find("li:first").text(), "6");
            start();
        });
    });

    runTest("PanelBar -- compile template loaded from server", function(dom, $scope){
        $scope.options = {
            contentUrls: [
                "ajax-template.html"
            ],
            contentLoad: function(ev) {
                equal(dom.find("div.content").text(), $scope.hello);
                start();
            }
        };
        $("<ul kendo-panelbar='panelbar' k-options='options'>" +
          "  <li><a>Title</a><div class='content'></div></li>" +
          "</ul>").appendTo(dom);
        expect(1);
        $scope.whenRendered(function(){
            $scope.panelbar.expand(dom.find("li:first"));
        });
    });

    runTest("TabStrip -- compile template loaded from server", function(dom, $scope){
        $scope.options = {
            contentUrls: [ "ajax-template.html" ],
            contentLoad: function(ev) {
                equal(dom.find("div.content").text(), $scope.hello);
                start();
            }
        };
        $("<div kendo-tabstrip k-options='options'>" +
          "  <ul><li class='k-state-active'>AJAX</li></ul>" +
          "  <div class='content'></div>" +
          "</div>").appendTo(dom);
        expect(1);
    });

    runTest("Splitter -- compile template loaded from server", function(dom, $scope){
        $scope.options = {
            panes: [ null, { contentUrl: "ajax-template.html" } ],
            contentLoad: function(ev) {
                equal(dom.find("div.content").text(), $scope.hello);
                start();
            }
        };
        $("<div kendo-splitter k-options='options'>" +
          "  <div></div>" +
          "  <div class='content'></div>" +
          "</div>").appendTo(dom);
        expect(1);
    });

    runTest("Tooltip -- compile template", function(dom, $scope){
        $scope.text = "{{3 + 3}}";
        var div = $("<div kendo-tooltip='tooltip' k-content='text'>foo</div>").appendTo(dom);
        expect(1);
        $scope.whenRendered(function(){
            $scope.tooltip.show(div);
            equal($scope.tooltip.content.text(), "6");
            start();
        });
    });

    runTest("Window -- compile content through Angular", function(dom, $scope){
        $scope.options = {
            content: "ajax-template.html",
            refresh: function() {
                var el = this.element;
                equal(el.text(), $scope.hello);
                start();
            }
        };
        $("<div kendo-window k-options='options'></div>").appendTo(dom);
        expect(1);
    });

    runTest("Window -- dataItem is available", function(dom, $scope){
        $scope.options = {
            content: {
                url: "data.json",
                dataType: "json",
                template: "<div>{{ dataItem.user.firstName }} {{ dataItem.user.lastName }}</div>"
            },
            refresh: function() {
                var el = this.element;
                equal(el.text(), "John Doe");
                start();
            }
        };
        $("<div kendo-window k-options='options'></div>").appendTo(dom);
        expect(1);
    });

    /// custom directives

    runTest("Custom directive with isolated scope", function(dom, $scope){
        $scope.options = {
            dataSource     : $scope.data,
            dataTextField  : "text",
            dataValueField : "id"
        };
        $scope.ns = { test: 1 };
        $("<div isolated-scope><select kendo-dropdownlist='ns.list' ng-model='ns.test' k-options='options'></select></div>").appendTo(dom);
        expect(2);
        setTimeout(function(){
            var dl = $scope.ns.list;
            equal(dom.find("h1").length, 1);
            dl.value(2);
            dl.element.trigger("change");
            equal($scope.ns.test, 2);
            start();
        }, 100);
    });

    /// mobile

    runTest("Mobile ListView -- compiles templates in data source", function(dom, $scope){
        $scope.options = {
            template   : "<div class='my-item'>{{ dataItem.id }}/{{ dataItem.text }}</div>",
            dataSource : $scope.data
        };
        $("<ul kendo-mobilelistview='list' k-options='options'></ul>").appendTo(dom);
        expect(2);
        $scope.whenRendered(function(){
            var items = $scope.list.element.find(".my-item");
            equal(items.eq(0).text(), "1/Foo");
            equal(items.eq(1).text(), "2/Bar");
            start();
        });
    });

    runTest("Mobile ScrollView -- compiles templates in data source", function(dom, $scope){
        expect(2);
        $scope.options = {
            template   : "<div class='my-item'>{{ dataItem.id }}/{{ dataItem.text }}</div>",
            dataSource : $scope.data
        };
        $("<ul kendo-mobilescrollview='list' k-options='options'></ul>").appendTo(dom);
        expect(2);

        $scope.whenRendered(function(){
            var items = $scope.list.element.find(".my-item");
            equal(items.eq(0).text(), "1/Foo");
            equal(items.eq(1).text(), "2/Bar");
            start();
        });
    });

});
