# Jassijs-Reporteditor
Jassijs Reporteditor is a visual tool for designing [pdfmake](http://pdfmake.org/) reports. The reports can be rendered with pdfmake to pdf either directly in the browser or server-side with nodes.
The report designer can be executed directly via [https://uwei.github.io/jassijs-reporteditor/web](https://uwei.github.io/jassijs-reporteditor/web). The report designer can also be integrated into your own websites. An example of this is [here](https://uwei.github.io/jassijs-reporteditor/simple).

## Runtime
The Jassijs report designer extends the syntax of pdfmake by filling data e.g. with the help of data tables. In order for the report to be filled at runtime, a conversion of the report design is necessary. Here is an (example)[https://uwei.github.io/jassijs-reporteditor/simple/usereport.html] or (with amd) [https://uwei.github.io/jassijs-reporteditor/simple/usereport-amd.html]:
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

## Quick Start:
The Jassijs Reportitor can be started directly in the [browser](https://uwei.github.io/jassijs-reporteditor/web). Please note that the reports stored there are not permanently stored and are lost when the browser cache is cleared.

The existing reports are displayed on the right side. Double-click to open the report in Code view. With Run the report opens in the design view. There, new report elements can be added from the palette via drag and drop. The properties of the selected report item can be changed in the property editor. In Code view, the report is displayed as Javascript code. 
With Run, changes in the code can be loaded back into the design view.
With button the created pdf can be viewed. There are many examples in the left side panel under Files that explain the report elements. Under pdfmake-Playground you will find examples of pdfmake. A detailed description of the syntax of pdfmake is described at www.
You can create your own folders and reports (right-click context menu) under Files. But remember that the reports are only stored in the browser and are lost when the browser cache is cleared.

## Limitations
Not all properties of the report elements that are possible with pdfmake can be set with the visual disigner, but these properties are not lost when editing the report.

## Syntax extensions
The following extensions of the pdfmake syntax can be used with the help of link. 
### templating:
With the help of javascript template strings, data can be filled into the report. The following example shows this. The data of the report are specified in the data field or as a 2nd parameter when filling the report.
Similar to data, parameters can also be filled in the report. 
### edittogether
For texts with different formatting, individual text elements must be linked in pdfmake. Text elements that are to be edited together in a text box in the Designer are marked with edittogether. The text can be edited comfortably (thanks TinyMCE).Screenshoot Leiste
### foreach
If the report data contain arrays, then this data can be filled into the report with foreach.
Here is a simple example link:
The element that is marked with foreach is repeated for each array element.
The array element can be accessed with $ {name}.
foreach $ name is the short form for foreach $ name in data.
If not the element itself but another report element is to be repeated,
can be used. Example.
### datatable
Syntax {
}
Beispiel
### format
## aggregate Functions


