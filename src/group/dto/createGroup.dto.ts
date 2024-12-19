import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { defaultIfEmpty } from "rxjs";

export class CreateGroupDto {
    @ApiProperty({
        description: 'Group name',
        minLength: 2,
        maxLength: 50,
        example: "Backend",
    })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    readonly name: string;

    @ApiProperty({
        description: 'description',
        example: "Hello, this is the description",
    })
    @IsString()
    @IsOptional()
    readonly description?: string;

    @IsOptional()
    readonly list_user_members?: number[];

}
