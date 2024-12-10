import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class UpdateProfile {
    @IsString()
    readonly  firstname: string;
    @IsString()
    readonly  lastname: string;
    @Type(() => Date)
    @IsDate()
    readonly dateofbirth: Date;

}