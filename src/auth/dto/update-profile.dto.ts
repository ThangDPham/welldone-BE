import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateProfile {   
    @ApiProperty({
        description: 'User name',
        minLength: 2,
        maxLength: 50,
        example: "Tuan Nguyen",
    })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly  name: string;

    @ApiProperty({
        description: 'User date of birth',
        example: "1990-05-15",
    })
    @Type(() => Date)
    @IsDate()
    readonly dateofbirth: Date;

}