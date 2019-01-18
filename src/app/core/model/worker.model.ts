import { Contracts } from "../constants/contracts.enum"
import { JobMain } from "./job-main.model"

export class Worker {
  constructor(
    public nameOrId: string,
    public contract: Contracts,
    public mainJob: JobMain,
    public approvedMentalHealthWorker?: string,
    public mainJobStartDate?: string
  ) {}
}
