import type { CreatePetInput, Pet } from "../models/pet.model";
import { PetRepository } from "../repositories/pet.repository";

export class PetService {
  constructor(private readonly petRepository = new PetRepository()) {}

  async create(input: CreatePetInput): Promise<Pet> {
    const pet = await this.petRepository.create(input);

    return pet;
  }
}
