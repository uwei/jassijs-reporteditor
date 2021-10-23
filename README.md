# Jassijs-Reporteditor
Jassijs Reporteditor is a visual tool for designing [pdfmake](http://pdfmake.org/) reports. The reports can be rendered with pdfmake to pdf either directly in the browser or server-side with nodes.
The report designer can be executed directly via [https://uwei.github.io/jassijs-reporteditor/web](https://uwei.github.io/jassijs-reporteditor/web). The report designer can also be integrated into your own websites. An example of this is [here](https://uwei.github.io/jassijs-reporteditor/simple).

## Runtime
The Jassijs report designer extends the syntax of pdfmake by filling data e.g. with the help of data tables. In order for the report to be filled at runtime, a conversion of the report design is necessary. Here is an [example](https://uwei.github.io/jassijs-reporteditor/simple/usereport.html) or [with amd](https://uwei.github.io/jassijs-reporteditor/simple/usereport-amd.html):
```html
<head>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.2/pdfmake.min.js'></script>
  <script src='https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.2/vfs_fonts.js'></script>
  <script src='http://localhost/jassijs/dist/pdfmakejassi.js'></script>
</head>
<body>
  <script>
		var docDefinition={
			content: [
				"Hallo ${name}",
				"${parameter.date}"
			]
		};
		//fill data  
		var data={name:"Max"};
		var parameter={date:"2021-10-15"};
		docDefinition=pdfmakejassi.createReportDefinition(docDefinition,data,parameter);

		pdfMake.createPdf(docDefinition).download();
	</script>
</body>
```
Here the conversion is done with: 
```javascript
docDefinition=pdfmakejassi.createReportDefinition(docDefinition,data,parameter);
```
## Quick Start:
The Jassijs Reportitor can be started directly in the [browser](https://uwei.github.io/jassijs-reporteditor/web). Please note that the reports stored there are not permanently stored and are lost when the browser cache is cleared.

The existing reports are displayed on the right side. Double-click to open the report in Code view as javascript. 
![jassijs-reporteditor1](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor1.jpg)

With Run ![jassijs-reporteditor2](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor2.jpg) the test-function ist called and the report opens in the **Design** view. 
![jassijs-reporteditor3](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor3.jpg)
There, new report elements can be added from the **Palette** via drag and drop. The **Properties** of the selected report item can be changed in the property editor. 

With ![jassijs-reporteditor4](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor4.jpg) the created pdf can be viewed. 
![jassijs-reporteditor5](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor5.jpg)

In the **Code** view, the report is displayed as Javascript code. With Run ![jassijs-reporteditor2](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor2.jpg) , changes in the code can be loaded back into the **Design** view.
There are many examples in the left side panel under Files that explain the report elements. Under pdfmake-Playground you will find examples of pdfmake. A detailed description of the syntax of pdfmake is described at [http://pdfmake.org/](http://pdfmake.org/).
You can create your own folders and reports (right-click context menu) under **Files**. But remember that the reports are only stored in the browser and are lost when the browser cache is cleared. You can also **Download** the __modified__ reports (right-click on a folder in **Files**).  

## Limitations
Not all properties of the report elements that are possible with pdfmake can be set with the visual disigner, but these properties are not lost when editing the report.

## Syntax extensions
The following extensions of the pdfmake syntax can be used. 

### templating:
With the help of javascript template strings, data can be filled into the report. The following example shows this.
```javascript
var reportdesign = {
	content: [
        "Hallo ${name}",
        "${address.street}",
        "${parameter.date}"
    ]
};

export function test() {
    return { 
        reportdesign,
        data:{
            name:"Klaus",
            address:{
                street:"Mainstreet 8"
            }
        },        
        parameter:{date:"2021-10-10"}      //parameter
    };
}
```
The **data** of the report are specified in the data field or as a 2nd parameter when filling the report with **pdfmakejassi.createReportDefinition(reportdesign,data,parameter)**.
This data could be filled into javascript Template-Strings like **${name}**.
Similar to data, parameters can also be filled in the report like **${parameter.date}**. 

### edittogether
For texts with different formatting, individual text elements must be linked in pdfmake. Text elements that are to be edited together in a text box in the Designer are marked with edittogether. The text can be edited comfortably (thanks TinyMCE).
![jassijs-reporteditor6](https://uwei.github.io/jassijs-reporteditor/doc/jassijs-reporteditor6.jpg)

### foreach
If the report data contain arrays, then this data can be filled into the report with foreach.
Here is a simple [example](https://uwei.github.io/jassijs-reporteditor/web/#do=jassijs_editor.CodeEditor&file=demoreports/10-Foreach.ts).
```javascript
var reportdesign = {
    content: [
        {
            foreach: "line",
            text: "${line.name}"
        }
};

export function test() {
    return {
        reportdesign,
        data: [
            { name: "line1" },
            { name: "line2" },
            { name: "line3" }
        ]
    };
}
```
The element that is marked with foreach is repeated for each array element.
The array element can be accessed with ${line.name}.
**foreach $line** is the short form for **foreach $line in data**.
If not the element itself but another report element is to be repeated, the report element **do**
can be used:
```javascript
table: {
     	body: [
             {
             	foreach: "line",
                do:["${line.name}"]
              }
        ]
}
```


### datatable
[example](https://uwei.github.io/jassijs-reporteditor/web/#do=jassijs_editor.CodeEditor&file=demoreports/21-Datatable.ts)
```javascript
var reportdesign = {
    content: [
        "A Simple datatable",
        {
            datatable: {
                header: ["id", "customer", "city"],
                footer: ["", "", ""],
                dataforeach: "cust",
                body: ["${cust.id}", "${cust.customer}", "${cust.city}"]
            }
        }
    ]
};
export function test() {
    var sampleData = [
        { id: 1, customer: "Fred", city: "Frankfurt" },
        { id: 8, customer: "Alma", city: "Dresden" },
        { id: 3, customer: "Heinz", city: "Frankfurt" }
    ];
    return {
        reportdesign,
        data:sampleData
    };
}
```
For each member in dataforeach the body is repeated. In this example for each cust in data. The header and the foorter is filled at the beginning and the end of the datatable.
Datatables could also have one or multiple groups - [example](https://uwei.github.io/jassijs-reporteditor/web/#do=jassijs_editor.CodeEditor&file=demoreports/22-Datatable.ts&line=1).
```javascript
datatable: {
                groups: [
                    {
                        header: ["${group1.name}", "", ""],
                        expression: "city",
                        footer: ["", "", ""]
                    },
                    {
                        header: ["${group2.name}", "", ""],
                        expression: "customer",
                        footer: ["custfooter", "", ""]
                    }
                ],
                ...
            }
```
Here the datatable is grouped firstly by city and secondly by customer. Each group can have a footer and a header. 
## aggregate Functions
Aggregate functions could be used to calc arrays or groups.
Function | Description
--- | ---
avg(array,field) | returns the average of an array.
count(array,field) | returns the number of items in an array.
max(array,field) | returns the maximum value in an array.
min(array,field) | returns the minimum value in an array
sum(array,field) | returns the sum of all values in an array

[Here](https://uwei.github.io/jassijs-reporteditor/web/#do=jassijs_editor.CodeEditor&file=demoreports/23-Datatable.ts) is an example.
```javascript
...
"${avg(group2,\"age\")}"
...
```
Here avg returns the average of the field age of all elements in the array group2.

### format
[Here](https://uwei.github.io/jassijs-reporteditor/web/#do=jassijs_editor.CodeEditor&file=demoreports/30-Format.ts) is an example.
For date and numbers you can define a pattern to format the value.

```javascript
table: {
	body: [
		["MM/DD/YYYY",{	text: "${date}",format: "MM/DD/YYYY"}],
		["DD.MM.YYYY",{	text: "${date}",format: "DD.MM.YYYY"}],
		["DD.MM.YYYY hh:mm:ss",	{text: "${date}",format: "DD.MM.YYYY hh:mm:ss"}	],
		["h:mm:ss A",{text: "${date}",format: "h:mm:ss A"}],
		["#.##0,00",{	text: "${num}",format: "#.##0,00"}],
		["#.##0,00 €",{	text: "${num}",	format: "#.##0,00 €"}],
		["$#,###.00",{text: "${num}",format: "$#,###.00"}]
	]
}
```
Output:
Format | Result 
--- | ---
MM/DD/YYYY | 09/23/2021
DD.MM.YYYY | 23.09.2021
DD.MM.YYYY hh:mm:ss | 23.09.2021 21:52:12
h:mm:ss A | 9:52:12 PM
#.##0,00 | 12.502,55
#.##0,00 € | 12.502,55 €
$#,###.00 | $12,502.55


