import { Column, PrimaryColumn, Entity } from 'typeorm';

@Entity('places')
export class Place {
  // 장소 고유 ID
  @PrimaryColumn()
  id: string;

  // 장소 이름
  @Column()
  displayName: string;

  // 주소
  @Column()
  formattedAddress: string;

  // 장소 타입
  @Column()
  primaryTypeDisplayName: string;

  // 사진 URL 배열
  @Column('json', { nullable: true })
  photos: string[];

  // 영업시간 요일별 배열
  @Column('json', { nullable: true })
  weekdayDescriptions: string[];

  // 사용자 평점
  @Column()
  userRatingCount: number;

  // 리뷰
  @Column('json', { nullable: true })
  reviews: {
    rating: number;
    text: string;
  }[];

  // 국가 전화번호
  @Column()
  nationalPhoneNumber: string;
}
