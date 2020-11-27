// import { ComponentFactoryResolver, ComponentRef, ElementRef, Injectable, Injector, Type } from '@angular/core';
// import { Establishment } from '@core/model/establishment.model';
// import { PdfFooterComponent } from '@features/pdf/footer/pdf-footer.component';
// import { PdfHeaderComponent } from '@features/pdf/header/pdf-header.component';
// import { PdfWorkplaceTitleComponent } from '@features/pdf/workplace-title/pdf-workplace-title.component';
// import { jsPDF } from 'jspdf';
// import Canvg from 'canvg';
//
// export interface PdfComponent {
//   content: ElementRef;
// }
//
// @Injectable({
//   providedIn: 'root',
// })
// export class PdfService {
//   constructor(private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector) {}
//
//   public async BuildBenchmarksPdf(elRef: ElementRef, aboutData: ElementRef, workplace: Establishment) {
//     const doc = new jsPDF('p', 'pt', 'a4');
//     const ptToPx = 1.3333333333;
//     const a4heightpx = doc.internal.pageSize.getHeight() * ptToPx;
//     const scale = 0.5;
//     const width = 1000;
//     const spacing = 50;
//     const y = 20;
//     const ypx = (y * ptToPx) / scale;
//     const html = document.createElement('div');
//
//     html.style.width = `${width}px`;
//     html.style.display = 'block';
//
//     const header = this.resolveComponent(PdfHeaderComponent);
//     const footer = this.resolveComponent(PdfFooterComponent);
//     // const workplaceTitle = this.resolveComponent(PdfWorkplaceTitleComponent, (c) => {
//     //   c.instance.workplace = workplace;
//     //   c.changeDetectorRef.detectChanges();
//     // });
//
//     html.append(header.cloneNode(true));
//     html.append(this.createSpacer(width, spacing));
//
//     //html.append(workplaceTitle.cloneNode(true));
//     html.append(this.createSpacer(width, spacing));
//   //  const htmlData = elRef.nativeElement.cloneNode(true);
//
//     html.append(elRef.nativeElement.cloneNode(true));
//
//     const footerPosition = a4heightpx - this.getHeight(html) * scale - (380 * scale + ypx);
//     html.append(this.createSpacer(width, footerPosition));
//     html.append(footer.cloneNode(true));
//     html.append(this.createSpacer(width, ypx * 2));
//
//     html.append(header.cloneNode(true));
//
//     html.append(this.createSpacer(width, spacing));
//
//     // const aboutDataHtml = aboutData.nativeElement.cloneNode(true);
//     // const allUl = aboutDataHtml.getElementsByTagName('ul');
//     // for (let ul of allUl) {
//     //   ul.style.listStyle = 'none';
//     //   ul.style.paddingLeft = '0';
//     // }
//     // const allLi = aboutDataHtml.getElementsByTagName('li');
//     // for (let li of allLi) {
//     //   li.textContent = '- ' + li.textContent;
//     // }
//     // html.append(aboutDataHtml);
//     const footerPg2Position = a4heightpx * 2 - this.getHeight(html) * scale - (480 * scale - ypx * 2);
//     html.append(this.createSpacer(width, footerPg2Position));
//     html.append(footer.cloneNode(true));
//
//     await this.saveHtmlToPdf('benchmarks.pdf', doc, html, y, scale, width);
//
//     return doc;
//   }
//
//   private async saveHtmlToPdf(filename, doc, html, y, scale, width) {
//     const widthHtml = width * scale;
//     const x = (doc.internal.pageSize.getWidth() - widthHtml) / 2;
//
//     const svgElements = html.getElementsByClassName("highcharts-root");
// console.log(svgElements);
//     //replace all svgs with a temp canvas
//     await svgElements.forEach(async function(svg) {
//       try {
//         // let  svg = svgElements[0]
//         var canvas, xml;
//
//         // canvg doesn't cope very well with em font sizes so find the calculated size in pixels and replace it in the element.
//         // $.each($(this).find('[style*=em]'), function(index, el) {
//         //   $(this).css('font-size', getStyle(el, 'font-size'));
//         // });
//         /// eslint-disable-next-line prefer-const
//         const canvas = document.createElement("canvas");
//         canvas.className = "screenShotTempCanvas";
//         let ctx = canvas.getContext('2d');
//         //convert SVG into a XML string
//         xml = (new XMLSerializer()).serializeToString(svg);
//         console.log(xml);
//
//         // Removing the name space as IE throws an error
//         // eslint-disable-next-line no-useless-escape
//         xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
//         // console.log(xml);
//         // console.log("Canvg");
//         // console.log(canvas);
//
//         //draw the SVG onto a canvas
//         let v = await Canvg.from(ctx, xml);
//         v.render();
//         console.log("Canvg end");
//
//         svg.parentNode.insertBefore(canvas, svg.nextSibling)
//         svg.remove();
//
//         console.log("end of loop");
//       }catch(err){
//
//       }
//
//     });
//     console.log(html);
//
//     const html2canvas = {
//       scale,
//       width,
//       windowWidth: width,
//     };
//
//
//     await doc.html(html, {
//       x,
//       y,
//       html2canvas,
//     });
//
//
//     // if(doc.getNumberOfPages() > 2) {
//     //   for (let i = doc.getNumberOfPages(); i > 2; i--) {
//     //     doc.deletePage(i);
//     //   }
//     // }
//
//     doc.save(filename);
//   }
//
//   private createSpacer(width: number, space: number) {
//     const spacer = document.createElement('div');
//     spacer.style.width = `${width}px`;
//     spacer.style.height = `${space}px`;
//     return spacer;
//   }
//
//   private getHeight(element) {
//     element.style.visibility = 'hidden';
//     document.body.appendChild(element);
//     const height = element.offsetHeight + 0;
//     document.body.removeChild(element);
//     element.style.visibility = 'visible';
//     return height;
//   }
//   /// eslint-disable-next-line no-empty-function
//   private resolveComponent<T extends PdfComponent>(
//     componentType: Type<T>,
//     /// eslint-disable-next-line no-empty-function
//     callback: (c: ComponentRef<T>) => void = (c) => {},
//   ) {
//     var componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
//     var component = componentFactory.create(this.injector);
//     callback(component);
//     return component.instance.content.nativeElement;
//   }
// }
