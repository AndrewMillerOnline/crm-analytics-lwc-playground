/**
 * This LWC is used for displaying a dataset's latest refresh date within CRM Analytics dashboards
 * 
 * Created By: Andrew Miller, 7/10/2022
 */

import { LightningElement, api, wire } from 'lwc';
import { getDataset } from 'lightning/analyticsWaveApi';

export default class DatasetRefreshDisplay extends LightningElement {

  @api fontColor;
  @api fontSize;
  @api refreshCadence;
  @api displayName;
  _label = "";

  @api
  get label() {
    return this._label;
  }

  //Use the wire adapter to call the Wave API and get the dataset information
  @api idOrApiName;
  @wire(getDataset, {
    datasetIdOrApiName: '$idOrApiName'
  })
  onGetDateset({ data, error }) {
    if (data) {
      //Get the dataset's refresh date
      let refreshDate = new Date(data.dataRefreshDate);

      let tempLabel = `${this.displayName} data as of ${refreshDate.toLocaleString()}.`

      //Calculate how many hours until the next refresh, if a cadence is provided
      if (this.refreshCadence) {
        //Make sure provided cadence is a valid number; if so, add next refresh time to display
        let cadence = parseInt(this.refreshCadence);
        if (cadence != NaN) {
          let nextRefresh = new Date(data.dataRefreshDate);
          nextRefresh.setTime(refreshDate.getTime() + (cadence * 3600000));
          let dateDiff = (nextRefresh - new Date()) / 3600000;

          //Only display the next refresh if it's not negative (aka: dataflow/recipe is running late)
          if (dateDiff > 0) {
            //If one or more hours remain, display in hours
            if (dateDiff > 1) {
              tempLabel += ` Next refresh in approximately ${dateDiff.toFixed(0)} hours.`;
            //If less than an hour remains, display in minutes
            } else {
              tempLabel += ` Next refresh in approximately ${(dateDiff*60).toFixed(0)} minutes.`;
            }
          }
        }
      }

      //Set the label
      this._label = tempLabel;
    }
  }

  //Set the font size and color on component render
  renderedCallback() {
    let span = this.template.querySelector("span");
    if (span != null) {
      span.style.color = this.fontColor;
      span.style.fontSize = this.fontSize;
    }
  }
}