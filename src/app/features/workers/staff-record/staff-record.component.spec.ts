// fdescribe('StaffRecordComponent', () => {
//   const worker = workerBuilder() as Worker;
//   //   const workplace = establishmentBuilder() as Establishment;

//   async function setup() {
//     const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(StaffRecordComponent, {
//       imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
//       providers: [
//         AlertService,
//         WindowRef,
//         BreadcrumbService,
//         DialogService,
//         EstablishmentService,
//         PermissionsService,
//         WorkerService,
//         {
//           provide: ActivatedRoute,
//           useValue: {
//             snapshot: {
//               data: {
//                 worker: worker,
//                 longTermAbsenceReasons: ['Maternity leave', 'Paternity leave', 'Illness', 'Injury', 'Other'],
//               },
//             },
//           },
//         },
//         {
//           provide: WorkerService,
//           useClass: MockWorkerServiceWithUpdateWorker,
//         },
//       ],
//     });

//     const component = fixture.componentInstance;

//     const injector = getTestBed();
//     const router = injector.inject(Router) as Router;
//     const routerSpy = spyOn(router, 'navigate');
//     routerSpy.and.returnValue(Promise.resolve(true));

//     const workerService = injector.inject(WorkerService) as WorkerService;
//     const updateWorkerSpy = spyOn(workerService, 'updateWorker');
//     updateWorkerSpy.and.callThrough();

//     return {
//       component,
//       fixture,
//       getByText,
//       getAllByText,
//       getByTestId,
//       queryByText,
//     };
//   }

//   it('should render a StaffRecordComponent', async () => {
//     const { component } = await setup();
//     expect(component).toBeTruthy();
//   });

//   xit('should display the worker name', async () => {
//     const { getByText } = await setup();

//     expect(getByText(worker.nameOrId)).toBeTruthy();
//   });

//   xit('should display the Long-Term Absence  if the worker is currently flagged as long term absent', async () => {
//     const { component, fixture, getByText } = await setup();

//     component.worker.longTermAbsence = 'Illness';
//     fixture.detectChanges();

//     expect(getByText('Long-Term Absence')).toBeTruthy();
//     expect(getByText('Flag long-term absence')).toBeFalsy();
//   });

//   xit('should not display the Long-Term Absence if the worker is not currently flagged as long term absent', async () => {
//     const { component, fixture, queryByText } = await setup();

//     component.worker.longTermAbsence = null;
//     fixture.detectChanges();

//     expect(queryByText('Flag long-term absence')).toBeTruthy();
//     expect(queryByText('Long-Term Absence')).toBeFalsy();
//   });

//   xit('should contain a local authorit return link that links to admin/local-authorities-return url', async () => {
//     const { component, fixture, getByTestId } = await setup();

//     const laCompletionsLink = within(getByTestId('longtermabsence'));
//     expect(laCompletionsLink.getByTestId('longtermabsence').getAttribute('href')).toBe('./long-term-absence');

//   });
// });
