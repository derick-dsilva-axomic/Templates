var indesign = new InDesign(data.templates.nip3);

var spread=0;
var images = data.albums[0].files;
//var imagesNeeded = 6;
var currentspread = 0;
var pages = 1;
var characterstyle = 'black11';


var displayFields = [
  'projectName'//,
  //'caption'
];

var keywordCodes = [
  'City',
  'Country'

];

var fieldCodes = [
  'Client',
  'Value',
  'WettbewerbsbeginnCompetitionStartDate',
  //'VOFVgVStartDate',
  'RealisierungvonImplementationStartDate',
  //'CompletionDate',
  'Size',
  'ShortDescription'
];

//Function defs
function appendProjectDetails(text, pageItem, spread, characterStyle){
    var pageItemPlaceolder = where().pageItems(pageItem);
    indesign.overridePageItems(spread, pageItemPlaceolder);
    indesign.appendText(text, pageItemPlaceolder.spreads(spread), characterStyle);
}

if(images.length == 6){
  indesign.addSpreads(1, where().spreads(spread));
  indesign.addPages(1,where().masterSpreads(2),where().spreads(spread));
}
if(images.length > 6){
  indesign.addSpreads(1, where().spreads(spread));
  indesign.addPages(1,where().masterSpreads(2),where().spreads(spread));
  indesign.addSpreads(1, where().spreads(spread+1));
  indesign.addPages(1,where().masterSpreads(3),where().spreads(spread+1));
}



//if(images.length !== imagesNeeded){
  //error('You need to select '+imagesNeeded+' or more images for this template');
//}

//this is to fix the problem that if 1st image is ref, you get awesome error
if(images[0].displayFields.projectCode)
{

for (var i = 0; i < images.length; i++){


  	if(i>5 && currentspread === 0){
      currentspread=1;
      pages = 2;
    }
  	//warning('currentspread'+currentspread);
  	//check if images are project

  	if(!images[i].displayFields.projectCode){
    	error('Image '+ images[i].displayFields.filename + ' is not a project image. Please select only project images');
	}

  	if(images[i].displayFields.projectCode !== images[0].displayFields.projectCode)
        error('Not all images are from the same project.');

   	var image = images[i];
  	var size = images[i].sizes.medium;

  	//check if image is valid
    if(size && size.width && size.height)
    {
        //place image on template
        var imagePlaceholder = where().pageItems('imageRectangle' + (i+1));
        indesign.overridePageItems(spread+currentspread, imagePlaceholder);


 		var imageLink = AwesomeHelpers.InDesign.generatePluginCompatibleFilePath
        (
            image.id,
            image.md5,
            size.url
        );

      	//ddsfor indescc
        indesign.setImage(imageLink, imagePlaceholder.spreads(spread + currentspread));

    }
  	else
      warning('Could not insert image ' + images[i].displayFields.filename + ' because the medium size does not exist');

}
  	//Fields
  	for ( var l =0; l < displayFields.length ; l++){
      field = displayFields[l];

      if(images[0].displayFields[field]){
        value = images[0].displayFields[field];

        if(field == 'projectName'){
          var projectName = value;
          var placeHolder = 'textBox'+field;
          //warning('placeHolder'+placeHolder);
          for(var z=0; z<pages;z++){
        		appendProjectDetails(value, placeHolder, spread+z);
          }
        }

        /*for(var z=0; z<pages;z++){
      		appendProjectDetails(value, placeHolder, spread+z);
        }*/

      }
      else
         {
        warning('There is no data in the ' + field + ' field for project ' + images[0].displayFields.projectName);
        value ='No Data for '+ field;
        appendProjectDetails(value, placeHolder, spread);
      }
    }


  /*	var placeHolder = 'projectName';
	var projName = 'No data on Project Name';
  	projName = images[0].displayFields.projectName;
  	var value = projName;
  	//warning('projectname'+projName);
  	appendProjectDetails(value, placeHolder, spread, 'Heading1');

	placeHolder = 'projectCode';
  	var projCode = 'No data on Project Code';
	projCode = images[0].displayFields.projectCode;
  	var value = projCode;
  	appendProjectDetails(value, placeHolder, spread, 'Heading1');
  */

  	//Fields
  	for(var j=0; j < fieldCodes.length; j++){
      var field = fieldCodes[j];
      //characterstyle = 'black11';
      placeHolder = 'textBox'+fieldCodes[j];

      if(images[0].projectFields[field] && images[0].projectFields[field].values[0])
      {
        var value = images[0].projectFields[field].values[0];

        if(images[0].projectFields[field].dataType === 'date')
          value = value.substr(6,2) + '/' + value.substr(4,2) + '/' + value.substr(0,4);
        //if(images[0].projectFields[field].name === 'Value')
          //value = '\u00a3 ' +value.substr(1,15);

        if(field === 'ShortDescription'){
          placeHolder='textBoxDescription';
          //value = value.replace(/[\r\n]{2,}/g, '\r\n');
          //value = value.substr(0,250);
        }

        if(field === 'WettbewerbsbeginnCompetitionStartDate'){
          placeHolder = 'textBoxCompstartdate';
          var field1 = 'VOFVgVStartDate';
          value = value.substr(0,4) + ' bis ' + images[0].projectFields[field1].values[0].substr(0,4);
          warning('value'+value);
        }

        if(field === 'RealisierungvonImplementationStartDate'){
          placeHolder = 'textBoxImpstartdate';
          field1 = 'CompletionDate';
          value = value.substr(0,4) + ' bis ' + images[0].projectFields[field1].values[0].substr(0,4);
          warning('value'+value);
        }

        appendProjectDetails(value, placeHolder, spread, characterstyle);
      }
      else {
        warning('There is no data in the ' + field + ' field for project ' + images[0].displayFields.projectName);
        value ='No Data for '+ field;
        appendProjectDetails(value, placeHolder, spread, characterstyle);
      }
    }

  	//Keywords
  	for(var k=0; k < keywordCodes.length; k++){
      var keyword = keywordCodes[k];
      //characterstyle = 'black11';
      placeHolder = 'textBox'+keywordCodes[k];

      if(images[0].projectKeywords.categories[keyword] && images[0].projectKeywords.categories[keyword].keywords[0].name)
      {
      	var value = images[0].projectKeywords.categories[keyword].keywords[0].name;
        //value = convertToUnicode(value);

        if(keyword == 'City'){
          for(z=0;z<pages;z++){
          placeHolder = placeHolder+z;
          }
       	}



      appendProjectDetails(value, placeHolder, spread, characterstyle);
      }
      else {
        warning('There is no data in the ' + keyword + ' keyword for project ' + images[0].displayFields.projectName);
      	value = 'No Data for '+keyword;
      	appendProjectDetails(value, placeHolder, spread, characterstyle);
      }
    }



}
else
error('Image '+ images[0].displayFields.filename + ' is not a project image. Please select only project images');

/*for(i=0;i<10;i++)
  warning(i);*/

var nowTime = AwesomeHelpers.Generic.jsDateTo14DigitDate(new Date());
indesign.save('NIP001_'+projectName+'_' + nowTime + '.idml');
