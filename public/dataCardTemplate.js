(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['dataCard'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "3";
},"3":function(container,depth0,helpers,partials,data) {
    return "2";
},"5":function(container,depth0,helpers,partials,data) {
    return "                    <td></td>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "                    <td>\r\n                        <div class = \"invul\">\r\n                            <p>4+</p>\r\n                        </div>\r\n                        \r\n                    </td>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                            ("
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"keywords") : depth0),{"name":"each","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":68,"column":29},"end":{"line":70,"column":37}}})) != null ? stack1 : "")
    + ")\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\r\n                                "
    + container.escapeExpression(container.lambda(depth0, depth0))
    + ((stack1 = lookupProperty(helpers,"unless").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"last")),{"name":"unless","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":69,"column":40},"end":{"line":69,"column":70}}})) != null ? stack1 : "")
    + "\r\n                            ";
},"11":function(container,depth0,helpers,partials,data) {
    return ", ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.lambda, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class = \"dataCard\">\r\n            <table class = \"target\">\r\n                <tr class = \"TargetName\">\r\n                    <td class = \"name\" colspan = "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"invul") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":4,"column":49},"end":{"line":4,"column":84}}})) != null ? stack1 : "")
    + ">\r\n                        <a href = \"/load?unitName="
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"attackerName") : depth0), depth0))
    + "%5Fvs%5F"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"defenderName") : depth0), depth0))
    + "\"><h1>"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"defenderName") : depth0), depth0))
    + "</h1></a>\r\n                    </td>\r\n                </tr>\r\n                <tr class = \"TargetLabels\">\r\n                    <td class = \"tLabel\">\r\n                        <p>T</p>\r\n                    </td>\r\n                    <td class = \"tLabel\">\r\n                        <p>SV</p>\r\n                    </td>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"invul") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":20},"end":{"line":17,"column":27}}})) != null ? stack1 : "")
    + "                </tr>\r\n                <tr class = \"TargetStats\">\r\n                    <td>\r\n                        <div class = \"tStat\">\r\n                            <p>"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"toughness") : depth0), depth0))
    + "</p>\r\n                        </div>\r\n                        \r\n                    </td>\r\n                    <td>\r\n                        <div class = \"tStat\">\r\n                             <p>"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"save") : depth0), depth0))
    + "+</p>\r\n                        </div>\r\n                    </td>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"invul") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":20},"end":{"line":38,"column":27}}})) != null ? stack1 : "")
    + "                </tr>\r\n            </table>\r\n            <h3>VS</h3>\r\n            <table>\r\n                <tr class = \"TargetName\" >\r\n                    <td colspan = 5 class = \"name aName\">\r\n                        <a href = \"/load?unitName="
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"attackerName") : depth0), depth0))
    + "%5Fvs%5F"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"defenderName") : depth0), depth0))
    + "\"><h1>"
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"attackerName") : depth0), depth0))
    + "</h1></a>\r\n                    </td>\r\n                </tr>\r\n                <tr class = \"WeaponLabels\">\r\n                    <td>\r\n                        <p>WEAPON</p>\r\n                    </td>\r\n                    <td>\r\n                        <p>A</p>\r\n                    </td>\r\n                    <td>\r\n                        <p>WS</p>\r\n                    </td>\r\n                    <td>\r\n                        <p>S</p>\r\n                    </td>\r\n                    <td>\r\n                        <p>AP</p>\r\n                    </td>\r\n                </tr>   \r\n                <tr class = \"WeaponInfo\">\r\n                    <td>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"keywords") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":67,"column":24},"end":{"line":71,"column":31}}})) != null ? stack1 : "")
    + "                    </td>\r\n                    <td class = \"wStat\">\r\n                        "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"attacks") : depth0), depth0))
    + "\r\n                    </td>\r\n                    <td class = \"wStat\">\r\n                        "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"ws") : depth0), depth0))
    + "\r\n                    </td>\r\n                    <td class = \"wStat\">\r\n                        "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"strength") : depth0), depth0))
    + "\r\n                    </td>\r\n                    <td class = \"wStat\">\r\n                        "
    + alias3(alias2((depth0 != null ? lookupProperty(depth0,"ap") : depth0), depth0))
    + "\r\n                    </td>\r\n                </tr>   \r\n            </table>\r\n        </div>\r\n        <br>\r\n        <br>";
},"useData":true});
})();