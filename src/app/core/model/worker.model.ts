import { Contracts } from "../constants/contracts.enum"
import { Job } from "./job.model"

export interface Worker {
  nameOrId: string
  contract: Contracts
  mainJob: Job
  approvedMentalHealthWorker?: string
  otherJobs?: Job[]
  mainJobStartDate?: string
  nationalInsuranceNumber?: string
  dateOfBirth?: string
  postcode?: string
  gender?: string
  disability?: string
  ethnicity?: number
}
